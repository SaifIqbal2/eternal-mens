<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';

session_start();
if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

// ---- Load full details for each cart line fresh from the DB ----
$lines = [];
$subtotal = 0;

foreach ($_SESSION['cart'] as $key => $entry) {
    $stmt = $pdo->prepare("
        SELECT p.id, p.name, p.slug, p.price AS base_price, p.stock AS base_stock,
               (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
        FROM products p WHERE p.id = ? AND p.status = 'ACTIVE'
    ");
    $stmt->execute([$entry['product_id']]);
    $product = $stmt->fetch();
    if (!$product) { unset($_SESSION['cart'][$key]); continue; }

    $variant_name = null;
    $price = $product['base_price'];
    $available_stock = $product['base_stock'];

    if ($entry['variant_id']) {
        $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE id = ?");
        $stmt->execute([$entry['variant_id']]);
        $variant = $stmt->fetch();
        if ($variant) {
            $variant_name = $variant['name'];
            $price = $variant['price_override'] ?? $product['base_price'];
            $available_stock = $variant['stock'];
        }
    }

    // clamp quantity to whatever is actually in stock right now
    $quantity = min($entry['quantity'], max($available_stock, 0));
    if ($quantity <= 0) { unset($_SESSION['cart'][$key]); continue; }
    if ($quantity !== $entry['quantity']) $_SESSION['cart'][$key]['quantity'] = $quantity;

    $line_total = $price * $quantity;
    $subtotal += $line_total;

    $lines[] = [
        'key' => $key,
        'product_id' => $product['id'],
        'variant_id' => $entry['variant_id'],
        'slug' => $product['slug'],
        'name' => $product['name'],
        'variant_name' => $variant_name,
        'image' => $product['image'] ?: 'assets/images/placeholder.jpg',
        'price' => $price,
        'quantity' => $quantity,
        'available_stock' => $available_stock,
        'line_total' => $line_total,
    ];
}

$shipping_cost = $subtotal > 0 ? 300 : 0; // flat rate; adjust as needed
$total = $subtotal + $shipping_cost;

$page_title = 'Your Cart';
require_once 'includes/header.php';
?>

<section class="section" style="padding-top:2.5rem;">
    <div class="container">
        <h1 class="section-heading">Your Cart</h1>

        <?php if (count($lines) === 0): ?>
            <div class="empty-state">
                <p>Your cart is empty.</p>
                <a href="collection.php" class="btn btn-outline-dark" style="margin-top:1.5rem;">Continue Shopping</a>
            </div>
        <?php else: ?>
        <div class="cart-layout">
            <div class="cart-lines">
                <?php foreach ($lines as $line): ?>
                <div class="cart-line">
                    <a href="product.php?slug=<?php echo h($line['slug']); ?>" class="cart-line-image">
                        <img src="<?php echo h($line['image']); ?>" alt="<?php echo h($line['name']); ?>">
                    </a>
                    <div class="cart-line-info">
                        <a href="product.php?slug=<?php echo h($line['slug']); ?>"><h3><?php echo h($line['name']); ?></h3></a>
                        <?php if ($line['variant_name']): ?><p style="font-size:0.85rem; color:var(--graphite-soft);"><?php echo h($line['variant_name']); ?></p><?php endif; ?>
                        <p class="mono" style="margin-top:0.5rem;"><?php echo format_price($line['price']); ?></p>

                        <form method="POST" action="cart-action.php" style="display:flex; align-items:center; gap:0.75rem; margin-top:0.75rem;">
                            <input type="hidden" name="action" value="update">
                            <input type="hidden" name="product_id" value="<?php echo (int)$line['product_id']; ?>">
                            <?php if ($line['variant_id']): ?><input type="hidden" name="variant_id" value="<?php echo (int)$line['variant_id']; ?>"><?php endif; ?>
                            <input type="hidden" name="redirect" value="cart.php">
                            <input type="number" name="quantity" value="<?php echo (int)$line['quantity']; ?>" min="1" max="<?php echo (int)$line['available_stock']; ?>" style="width:70px; border:1px solid var(--hairline); padding:0.4rem;" onchange="this.form.submit()">
                            <button type="submit" class="btn btn-outline-dark" style="padding:0.5rem 1rem; font-size:0.7rem;">Update</button>
                        </form>

                        <form method="POST" action="cart-action.php" style="margin-top:0.5rem;">
                            <input type="hidden" name="action" value="remove">
                            <input type="hidden" name="product_id" value="<?php echo (int)$line['product_id']; ?>">
                            <?php if ($line['variant_id']): ?><input type="hidden" name="variant_id" value="<?php echo (int)$line['variant_id']; ?>"><?php endif; ?>
                            <input type="hidden" name="redirect" value="cart.php">
                            <button type="submit" style="background:none; border:none; font-size:0.75rem; color:var(--danger); text-decoration:underline;">Remove</button>
                        </form>
                    </div>
                    <div class="mono" style="font-weight:500;"><?php echo format_price($line['line_total']); ?></div>
                </div>
                <?php endforeach; ?>

                <a href="collection.php" style="display:inline-block; margin-top:1rem; font-size:0.85rem; text-decoration:underline;">← Continue Shopping</a>
            </div>

            <div class="cart-summary">
                <h3 style="font-family:var(--font-display); font-size:1.3rem; margin-bottom:1.25rem;">Order Summary</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.9rem;">
                    <span>Subtotal</span><span class="mono"><?php echo format_price($subtotal); ?></span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.9rem;">
                    <span>Shipping</span><span class="mono"><?php echo format_price($shipping_cost); ?></span>
                </div>
                <div style="border-top:1px solid var(--hairline); margin-top:0.75rem; padding-top:0.75rem; display:flex; justify-content:space-between; font-size:1.1rem;">
                    <span>Total</span><span class="mono"><?php echo format_price($total); ?></span>
                </div>
                <a href="checkout.php" class="btn btn-primary btn-block" style="margin-top:1.5rem;">Proceed to Checkout</a>
            </div>
        </div>
        <?php endif; ?>
    </div>
</section>

<style>
.cart-layout { display:grid; grid-template-columns:1fr; gap:2.5rem; }
@media (min-width: 900px) { .cart-layout { grid-template-columns: 2fr 1fr; } }
.cart-line { display:flex; gap:1.25rem; padding:1.5rem 0; border-bottom:1px solid var(--hairline); }
.cart-line-image { width:90px; height:90px; flex-shrink:0; overflow:hidden; background:var(--hairline); }
.cart-line-image img { width:100%; height:100%; object-fit:cover; }
.cart-line-info { flex:1; }
.cart-summary { border:1px solid var(--hairline); padding:1.75rem; align-self:start; }
</style>

<?php require_once 'includes/footer.php'; ?>
