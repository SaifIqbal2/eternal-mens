<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';

$order_number = $_GET['order'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ?");
$stmt->execute([$order_number]);
$order = $stmt->fetch();

if (!$order) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
$stmt->execute([$order['id']]);
$items = $stmt->fetchAll();

$page_title = 'Order Confirmed';
require_once 'includes/header.php';
?>
<section class="section text-center" style="padding-top:4rem;">
    <div class="container" style="max-width:600px;">
        <p class="section-eyebrow">Thank You</p>
        <h1 class="section-heading">Order Confirmed</h1>
        <p style="color:var(--graphite);">Your order <strong class="mono"><?php echo h($order['order_number']); ?></strong> has been placed successfully. Please keep your order number for future reference.</p>

        <div style="text-align:left; border:1px solid var(--hairline); padding:1.75rem; margin-top:2.5rem;">
            <?php foreach ($items as $item): ?>
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.75rem;">
                    <span><?php echo h($item['product_name']); ?><?php echo $item['variant_name'] ? ' (' . h($item['variant_name']) . ')' : ''; ?> × <?php echo $item['quantity']; ?></span>
                    <span class="mono"><?php echo format_price($item['line_total']); ?></span>
                </div>
            <?php endforeach; ?>
            <div style="display:flex; justify-content:space-between; border-top:1px solid var(--hairline); padding-top:1rem; margin-top:0.5rem; font-size:1.1rem;">
                <span>Total</span><span class="mono"><?php echo format_price($order['total']); ?></span>
            </div>
        </div>

        <p style="margin-top:1.5rem; font-size:0.85rem; color:var(--graphite-soft);">
            Payment method: <?php echo $order['payment_method'] === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'; ?><br>
            You can track this order anytime using your order number and email on our
            <a href="order-tracking.php" style="text-decoration:underline;">Order Tracking</a> page.
        </p>

        <a href="collection.php" class="btn btn-outline-dark" style="margin-top:2rem;">Continue Shopping</a>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
