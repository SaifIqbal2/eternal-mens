<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';

session_start();
if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

// ---- Load cart lines fresh (same logic as cart.php) ----
function load_cart_lines($pdo) {
    $lines = [];
    $subtotal = 0;
    foreach ($_SESSION['cart'] as $key => $entry) {
        $stmt = $pdo->prepare("SELECT id, name, sku, price AS base_price, stock AS base_stock FROM products WHERE id = ? AND status = 'ACTIVE'");
        $stmt->execute([$entry['product_id']]);
        $product = $stmt->fetch();
        if (!$product) continue;

        $variant_name = null; $variant_id = null; $sku = $product['sku'];
        $price = $product['base_price']; $available_stock = $product['base_stock'];

        if ($entry['variant_id']) {
            $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE id = ?");
            $stmt->execute([$entry['variant_id']]);
            $variant = $stmt->fetch();
            if ($variant) {
                $variant_id = $variant['id'];
                $variant_name = $variant['name'];
                $sku = $variant['sku'];
                $price = $variant['price_override'] ?? $product['base_price'];
                $available_stock = $variant['stock'];
            }
        }

        $quantity = min($entry['quantity'], max($available_stock, 0));
        if ($quantity <= 0) continue;

        $line_total = $price * $quantity;
        $subtotal += $line_total;

        $lines[] = [
            'product_id' => $product['id'], 'variant_id' => $variant_id,
            'name' => $product['name'], 'variant_name' => $variant_name, 'sku' => $sku,
            'price' => $price, 'quantity' => $quantity, 'line_total' => $line_total,
        ];
    }
    return [$lines, $subtotal];
}

[$lines, $subtotal] = load_cart_lines($pdo);

if (count($lines) === 0) {
    header('Location: cart.php');
    exit;
}

$errors = [];
$discount_amount = 0;
$applied_discount_code = $_POST['discount_code'] ?? ($_SESSION['discount_code'] ?? '');

// ---- Handle "Apply Discount" (separate small submit, keeps user on this page) ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['apply_discount'])) {
    $code = trim($_POST['discount_code']);
    $stmt = $pdo->prepare("SELECT * FROM discounts WHERE code = ? AND is_active = 1");
    $stmt->execute([$code]);
    $discount = $stmt->fetch();
    if (!$discount) {
        $errors[] = 'That discount code is not valid.';
        $_SESSION['discount_code'] = '';
    } elseif ($discount['expires_at'] && strtotime($discount['expires_at']) < time()) {
        $errors[] = 'That discount code has expired.';
        $_SESSION['discount_code'] = '';
    } elseif ($discount['usage_limit'] && $discount['times_used'] >= $discount['usage_limit']) {
        $errors[] = 'That discount code has reached its usage limit.';
        $_SESSION['discount_code'] = '';
    } elseif ($discount['min_order_amount'] && $subtotal < $discount['min_order_amount']) {
        $errors[] = 'Your order does not meet the minimum amount for this code.';
        $_SESSION['discount_code'] = '';
    } else {
        $_SESSION['discount_code'] = $code;
        $applied_discount_code = $code;
    }
}

// Recalculate discount amount for display / final order if a code is applied
if ($applied_discount_code && empty($errors)) {
    $stmt = $pdo->prepare("SELECT * FROM discounts WHERE code = ? AND is_active = 1");
    $stmt->execute([$applied_discount_code]);
    $discount = $stmt->fetch();
    if ($discount) {
        $discount_amount = $discount['type'] === 'PERCENTAGE'
            ? round($subtotal * ($discount['value'] / 100))
            : min($discount['value'], $subtotal);
    }
}

$shipping_cost = 0;
$total = max($subtotal - $discount_amount + $shipping_cost, 0);

// ---- Handle final order placement ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['place_order'])) {
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $postal = trim($_POST['postal'] ?? '');
    $country = trim($_POST['country'] ?? 'Pakistan');
    $payment_method = $_POST['payment_method'] ?? 'COD';

    if ($name === '') $errors[] = 'Name is required.';
    if ($phone === '') $errors[] = 'Phone number is required.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email is required.';
    if ($address === '') $errors[] = 'Shipping address is required.';
    if ($city === '') $errors[] = 'City is required.';
    if (!in_array($payment_method, ['COD', 'BANK_TRANSFER'])) $errors[] = 'Invalid payment method.';

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            // Re-check stock right before committing, in case it changed
            foreach ($lines as $line) {
                if ($line['variant_id']) {
                    $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ? FOR UPDATE");
                    $stmt->execute([$line['variant_id']]);
                } else {
                    $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ? FOR UPDATE");
                    $stmt->execute([$line['product_id']]);
                }
                $row = $stmt->fetch();
                if (!$row || $row['stock'] < $line['quantity']) {
                    throw new Exception("Sorry, \"{$line['name']}\" no longer has enough stock. Please update your cart.");
                }
            }

            $temp_order_number = 'TEMP-' . uniqid();
            $stmt = $pdo->prepare("
                INSERT INTO orders
                  (order_number, customer_name, customer_email, customer_phone,
                   shipping_line1, shipping_city, shipping_postal, shipping_country,
                   subtotal, shipping_cost, discount_amount, total, discount_code,
                   payment_method, payment_status, status, stock_deducted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', 'PENDING', 1)
            ");
            $stmt->execute([
                $temp_order_number, $name, $email, $phone, $address, $city, $postal, $country,
                $subtotal, $shipping_cost, $discount_amount, $total,
                $applied_discount_code ?: null, $payment_method,
            ]);
            $order_id = $pdo->lastInsertId();
            $order_number = generate_order_number($order_id);
            $pdo->prepare("UPDATE orders SET order_number = ? WHERE id = ?")->execute([$order_number, $order_id]);

            foreach ($lines as $line) {
                $stmt = $pdo->prepare("
                    INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, quantity, line_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $order_id, $line['product_id'], $line['variant_id'],
                    $line['name'], $line['variant_name'], $line['sku'],
                    $line['price'], $line['quantity'], $line['line_total'],
                ]);

                // Deduct stock + log it
                if ($line['variant_id']) {
                    $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ?");
                    $stmt->execute([$line['variant_id']]);
                    $prev = $stmt->fetch()['stock'];
                    $new = $prev - $line['quantity'];
                    $pdo->prepare("UPDATE product_variants SET stock = ? WHERE id = ?")->execute([$new, $line['variant_id']]);
                } else {
                    $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                    $stmt->execute([$line['product_id']]);
                    $prev = $stmt->fetch()['stock'];
                    $new = $prev - $line['quantity'];
                    $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?")->execute([$new, $line['product_id']]);
                }
                $pdo->prepare("
                    INSERT INTO inventory_logs (product_id, variant_id, previous_qty, change_qty, new_qty, reason, order_id)
                    VALUES (?, ?, ?, ?, ?, 'ORDER_PLACED', ?)
                ")->execute([$line['product_id'], $line['variant_id'], $prev, -$line['quantity'], $new, $order_id]);
            }

            if ($applied_discount_code) {
                $pdo->prepare("UPDATE discounts SET times_used = times_used + 1 WHERE code = ?")->execute([$applied_discount_code]);
            }

            $pdo->commit();

            // Clear cart
            $_SESSION['cart'] = [];
            $_SESSION['discount_code'] = '';

            header('Location: order-confirmation.php?order=' . urlencode($order_number));
            exit;

        } catch (Exception $e) {
            $pdo->rollBack();
            $errors[] = $e->getMessage();
        }
    }
}

$page_title = 'Checkout';
require_once 'includes/header.php';
?>

<section class="section" style="padding-top:2.5rem;">
    <div class="container">
        <h1 class="section-heading">Checkout</h1>

        <?php if (!empty($errors)): ?>
            <div style="background:#fbeaea; border:1px solid var(--danger); color:var(--danger); padding:1rem 1.25rem; margin-bottom:2rem; font-size:0.9rem;">
                <?php foreach ($errors as $e): ?><p><?php echo h($e); ?></p><?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="cart-layout">
            <form method="POST" action="checkout.php" id="checkoutForm" style="display:contents">
            <div>
                <h3 style="font-family:var(--font-display); font-size:1.3rem; margin-bottom:1.25rem;">Contact & Shipping</h3>
                <div class="form-group"><label>Full Name</label><input type="text" name="name" value="<?php echo h($_POST['name'] ?? ''); ?>" required></div>
                <div class="form-group"><label>Phone Number</label><input type="tel" name="phone" value="<?php echo h($_POST['phone'] ?? ''); ?>" required></div>
                <div class="form-group"><label>Email</label><input type="email" name="email" value="<?php echo h($_POST['email'] ?? ''); ?>" required></div>
                <div class="form-group"><label>Address</label><input type="text" name="address" value="<?php echo h($_POST['address'] ?? ''); ?>" required></div>
                <div style="display:flex; gap:1rem;">
                    <div class="form-group" style="flex:1;"><label>City</label><input type="text" name="city" value="<?php echo h($_POST['city'] ?? ''); ?>" required></div>
                    <div class="form-group" style="flex:1;"><label>Postal Code</label><input type="text" name="postal" value="<?php echo h($_POST['postal'] ?? ''); ?>"></div>
                </div>
                <div class="form-group"><label>Country</label><input type="text" name="country" value="<?php echo h($_POST['country'] ?? 'Pakistan'); ?>" required></div>

                <h3 style="font-family:var(--font-display); font-size:1.3rem; margin:2rem 0 1.25rem;">Payment Method</h3>
                <div class="form-group" style="display:flex; align-items:center; gap:0.6rem;">
                    <input type="radio" name="payment_method" value="COD" id="cod" style="width:auto;" checked>
                    <label for="cod" style="margin:0;">Cash on Delivery</label>
                </div>
                <div class="form-group" style="display:flex; align-items:center; gap:0.6rem;">
                    <input type="radio" name="payment_method" value="BANK_TRANSFER" id="bank" style="width:auto;">
                    <label for="bank" style="margin:0;">Bank Transfer (After placing your order, you'll recieve payment details)</label>
                </div>

                <button type="submit" name="place_order" value="1" class="btn btn-primary btn-block" style="margin-top:1.5rem;">Place Order</button>
            </div>

            <div class="cart-summary">
                <h3 style="font-family:var(--font-display); font-size:1.3rem; margin-bottom:1.25rem;">Order Summary</h3>
                <?php foreach ($lines as $line): ?>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.6rem; color:var(--graphite);">
                        <span><?php echo h($line['name']); ?><?php echo $line['variant_name'] ? ' (' . h($line['variant_name']) . ')' : ''; ?> × <?php echo $line['quantity']; ?></span>
                        <span class="mono"><?php echo format_price($line['line_total']); ?></span>
                    </div>
                <?php endforeach; ?>

                <div style="display:flex; gap:0.5rem; margin:1.25rem 0;">
                    <input type="text" name="discount_code" placeholder="Discount code" value="<?php echo h($applied_discount_code); ?>" style="flex:1; border:1px solid var(--hairline); padding:0.6rem;" id="discountCodeInput">
                    <button type="submit" name="apply_discount" value="1" class="btn btn-outline-dark" id="applyDiscountBtn" style="padding:0.6rem 1rem; font-size:0.7rem;">Apply</button>
                </div>

                <div style="border-top:1px solid var(--hairline); padding-top:1rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.9rem;"><span>Subtotal</span><span class="mono"><?php echo format_price($subtotal); ?></span></div>
                    <?php if ($discount_amount > 0): ?>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.9rem; color:var(--success);"><span>Discount</span><span class="mono">-<?php echo format_price($discount_amount); ?></span></div>
                    <?php endif; ?>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.9rem;"><span>Shipping</span><span class="mono"><?php echo format_price($shipping_cost); ?></span></div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid var(--hairline); padding-top:0.75rem; font-size:1.1rem;"><span>Total</span><span class="mono"><?php echo format_price($total); ?></span></div>
                </div>
            </div>
            </form>
        </div>
    </div>
</section>

<script>

document.getElementById('checkoutForm').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'discountCodeInput') {
        e.preventDefault();
        document.getElementById('applyDiscountBtn').click();
    } else if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>