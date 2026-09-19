<?php
require_once 'includes/auth.php';

$order_id = (int)($_GET['id'] ?? 0);

// ---- Handle status change ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $new_status = $_POST['status'];
    $valid_statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

    if (in_array($new_status, $valid_statuses)) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();

        if ($order) {
            $old_status = $order['status'];
            $was_cancelled = in_array($old_status, ['CANCELLED', 'REFUNDED']);
            $will_be_cancelled = in_array($new_status, ['CANCELLED', 'REFUNDED']);

            // Stock follows the order state:
            // active order = stock deducted, cancelled/refunded = stock restored.
            // Only change stock when crossing between these two states.
            if ($was_cancelled && !$will_be_cancelled && $order['stock_deducted'] && $order['stock_restored']) {
                $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $stmt->execute([$order_id]);
                $items = $stmt->fetchAll();

                foreach ($items as $item) {
                    if ($item['variant_id']) {
                        $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ?");
                        $stmt->execute([$item['variant_id']]);
                        $prev = $stmt->fetchColumn();
                        $new = $prev - $item['quantity'];
                        $pdo->prepare("UPDATE product_variants SET stock = ? WHERE id = ?")->execute([$new, $item['variant_id']]);
                        sync_product_stock($pdo, $item['product_id']);
                    } else {
                        $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                        $stmt->execute([$item['product_id']]);
                        $prev = $stmt->fetchColumn();
                        $new = $prev - $item['quantity'];
                        $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?")->execute([$new, $item['product_id']]);
                    }

                    $pdo->prepare("
                        INSERT INTO inventory_logs (product_id, variant_id, previous_qty, change_qty, new_qty, reason, order_id, admin_id)
                        VALUES (?, ?, ?, ?, ?, 'ORDER_RECONFIRMED', ?, ?)
                    ")->execute([$item['product_id'], $item['variant_id'], $prev, -$item['quantity'], $new, $order_id, $current_admin['id']]);
                }

                $pdo->prepare("UPDATE orders SET stock_restored = 0 WHERE id = ?")->execute([$order_id]);
            } elseif (!$was_cancelled && $will_be_cancelled && $order['stock_deducted'] && !$order['stock_restored']) {
                $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $stmt->execute([$order_id]);
                $items = $stmt->fetchAll();

                foreach ($items as $item) {
                    $reason = $new_status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_REFUNDED';
                    if ($item['variant_id']) {
                        $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ?");
                        $stmt->execute([$item['variant_id']]);
                        $prev = $stmt->fetchColumn();
                        $new = $prev + $item['quantity'];
                        $pdo->prepare("UPDATE product_variants SET stock = ? WHERE id = ?")->execute([$new, $item['variant_id']]);
                        sync_product_stock($pdo, $item['product_id']);
                    } else {
                        $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                        $stmt->execute([$item['product_id']]);
                        $prev = $stmt->fetchColumn();
                        $new = $prev + $item['quantity'];
                        $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?")->execute([$new, $item['product_id']]);
                    }
                    $pdo->prepare("
                        INSERT INTO inventory_logs (product_id, variant_id, previous_qty, change_qty, new_qty, reason, order_id, admin_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ")->execute([$item['product_id'], $item['variant_id'], $prev, $item['quantity'], $new, $reason, $order_id, $current_admin['id']]);
                }
                $pdo->prepare("UPDATE orders SET stock_restored = 1 WHERE id = ?")->execute([$order_id]);
            }

            $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?")->execute([$new_status, $order_id]);
        }
    }

    if (isset($_POST['payment_status'])) {
        $valid_payment = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED'];
        if (in_array($_POST['payment_status'], $valid_payment)) {
            $pdo->prepare("UPDATE orders SET payment_status = ? WHERE id = ?")->execute([$_POST['payment_status'], $order_id]);
        }
    }

    header('Location: order-detail.php?id=' . $order_id . '&updated=1');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$order_id]);
$order = $stmt->fetch();
if (!$order) { header('Location: orders.php'); exit; }

$stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
$stmt->execute([$order_id]);
$items = $stmt->fetchAll();

$page_title = 'Order ' . $order['order_number'];
$active_nav = 'orders';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['updated'])): ?><div class="alert alert-success">Order updated.</div><?php endif; ?>

<a href="orders.php" class="text-soft" style="font-size:0.85rem;">← Back to Orders</a>

<div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem; margin-top:1rem;" class="order-layout">
    <div>
        <div class="panel">
            <h2>Items</h2>
            <div class="table-wrap">
            <table>
                <tr><th>Product</th><th>SKU</th><th>Price</th><th>Qty</th><th>Total</th></tr>
                <?php foreach ($items as $item): ?>
                <tr>
                    <td><?php echo h($item['product_name']); ?><?php echo $item['variant_name'] ? ' (' . h($item['variant_name']) . ')' : ''; ?></td>
                    <td class="mono"><?php echo h($item['sku']); ?></td>
                    <td class="mono"><?php echo format_price($item['unit_price']); ?></td>
                    <td><?php echo (int)$item['quantity']; ?></td>
                    <td class="mono"><?php echo format_price($item['line_total']); ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
            </div>
            <div style="margin-top:1rem; text-align:right; font-size:0.85rem;">
                <p>Subtotal: <span class="mono"><?php echo format_price($order['subtotal']); ?></span></p>
                <?php if ($order['discount_amount'] > 0): ?><p>Discount (<?php echo h($order['discount_code']); ?>): <span class="mono">-<?php echo format_price($order['discount_amount']); ?></span></p><?php endif; ?>
                <p>Shipping: <span class="mono"><?php echo format_price($order['shipping_cost']); ?></span></p>
                <p style="font-size:1.1rem; font-weight:600; margin-top:0.5rem;">Total: <span class="mono"><?php echo format_price($order['total']); ?></span></p>
            </div>
        </div>

        <div class="panel">
            <h2>Customer & Shipping</h2>
            <p><?php echo h($order['customer_name']); ?></p>
            <p class="text-soft"><?php echo h($order['customer_email']); ?> · <?php echo h($order['customer_phone']); ?></p>
            <p class="mt-1"><?php echo h($order['shipping_line1']); ?>, <?php echo h($order['shipping_city']); ?><?php echo $order['shipping_postal'] ? ', ' . h($order['shipping_postal']) : ''; ?>, <?php echo h($order['shipping_country']); ?></p>
        </div>
    </div>

    <div>
        <div class="panel">
            <h2>Order Status</h2>
            <form method="POST" action="order-detail.php?id=<?php echo $order_id; ?>">
                <div class="form-row">
                    <label>Status</label>
                    <select name="status">
                        <?php foreach (['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'] as $s): ?>
                            <option value="<?php echo $s; ?>" <?php echo $order['status'] === $s ? 'selected' : ''; ?>><?php echo ucfirst(strtolower($s)); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-row">
                    <label>Payment Status</label>
                    <select name="payment_status">
                        <?php foreach (['UNPAID','PAID','REFUNDED','FAILED'] as $s): ?>
                            <option value="<?php echo $s; ?>" <?php echo $order['payment_status'] === $s ? 'selected' : ''; ?>><?php echo ucfirst(strtolower($s)); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <p class="text-soft" style="font-size:0.78rem; margin-bottom:0.75rem;">Switching to Cancelled or Refunded automatically restores stock (once only).</p>
                <button type="submit" name="update_status" value="1" class="btn btn-primary" style="width:100%;">Update Order</button>
            </form>
        </div>

        <div class="panel">
            <h2>Payment Method</h2>
            <p><?php echo $order['payment_method'] === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'; ?></p>
        </div>
    </div>
</div>

<style>@media (max-width: 900px) { .order-layout { grid-template-columns: 1fr !important; } }</style>

<?php require_once 'includes/admin-footer.php'; ?>
