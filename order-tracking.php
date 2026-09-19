<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';

$order = null;
$not_found = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_number = trim($_POST['order_number'] ?? '');
    $email = trim($_POST['email'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ? AND customer_email = ?");
    $stmt->execute([$order_number, $email]);
    $order = $stmt->fetch();
    if (!$order) $not_found = true;
}

$statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

$page_title = 'Order Tracking';
require_once 'includes/header.php';
?>
<section class="section" style="padding-top:2.5rem;">
    <div class="container" style="max-width:600px;">
        <h1 class="section-heading">Track Your Order</h1>

        <form method="POST" action="order-tracking.php">
            <div class="form-group"><label>Order Number</label><input type="text" name="order_number" placeholder="ORD-1001" value="<?php echo h($_POST['order_number'] ?? ''); ?>" required></div>
            <div class="form-group"><label>Email Used at Checkout</label><input type="email" name="email" value="<?php echo h($_POST['email'] ?? ''); ?>" required></div>
            <button type="submit" class="btn btn-primary btn-block">Track Order</button>
        </form>

        <?php if ($not_found): ?>
            <p style="margin-top:1.5rem; color:var(--danger);">We couldn't find an order matching those details.</p>
        <?php endif; ?>

        <?php if ($order): ?>
            <div style="margin-top:2.5rem; border:1px solid var(--hairline); padding:1.75rem;">
                <p class="mono" style="font-size:1.1rem; margin-bottom:0.5rem;"><?php echo h($order['order_number']); ?></p>
                <p style="font-size:0.85rem; color:var(--graphite-soft); margin-bottom:1.5rem;">Placed on <?php echo date('d M Y', strtotime($order['created_at'])); ?></p>

                <?php if (in_array($order['status'], ['CANCELLED', 'REFUNDED'])): ?>
                    <p style="color:var(--danger); font-weight:600;"><?php echo $order['status'] === 'CANCELLED' ? 'This order was cancelled.' : 'This order was refunded.'; ?></p>
                <?php else: ?>
                    <div class="tracker">
                        <?php $current_index = array_search($order['status'], $statuses); ?>
                        <?php foreach ($statuses as $i => $s): ?>
                            <div class="tracker-step <?php echo $i <= $current_index ? 'done' : ''; ?>">
                                <div class="tracker-dot"></div>
                                <span><?php echo ucfirst(strtolower($s)); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</section>

<style>
.tracker { display:flex; justify-content:space-between; position:relative; }
.tracker::before { content:''; position:absolute; top:6px; left:0; right:0; height:1px; background:var(--hairline); }
.tracker-step { display:flex; flex-direction:column; align-items:center; gap:0.6rem; font-size:0.7rem; color:var(--graphite-soft); position:relative; z-index:1; flex:1; text-align:center; }
.tracker-dot { width:13px; height:13px; border-radius:50%; background:var(--bone); border:2px solid var(--hairline); }
.tracker-step.done { color:var(--ink); }
.tracker-step.done .tracker-dot { background:var(--brass); border-color:var(--brass); }
</style>

<?php require_once 'includes/footer.php'; ?>
