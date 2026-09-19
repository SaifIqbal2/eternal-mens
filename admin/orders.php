<?php
require_once 'includes/auth.php';

$status_filter = $_GET['status'] ?? '';
$where = "1=1";
$params = [];
if ($status_filter !== '') {
    $where = "status = ?";
    $params = [$status_filter];
}
$stmt = $pdo->prepare("SELECT * FROM orders WHERE $where ORDER BY created_at DESC");
$stmt->execute($params);
$orders = $stmt->fetchAll();

$statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

$page_title = 'Orders';
$active_nav = 'orders';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['deleted'])): ?><div class="alert alert-success">Order deleted successfully.</div><?php endif; ?>
<?php if (isset($_GET['delete_error'])): ?><div class="alert alert-danger">Could not delete the order. Please try again.</div><?php endif; ?>

<div class="panel">
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <a href="orders.php" class="btn btn-sm <?php echo $status_filter === '' ? 'btn-primary' : 'btn-outline'; ?>">All</a>
        <?php foreach ($statuses as $s): ?>
            <a href="orders.php?status=<?php echo $s; ?>" class="btn btn-sm <?php echo $status_filter === $s ? 'btn-primary' : 'btn-outline'; ?>"><?php echo ucfirst(strtolower($s)); ?></a>
        <?php endforeach; ?>
    </div>
</div>

<div class="panel">
    <?php if (count($orders) === 0): ?>
        <div class="empty">No orders found.</div>
    <?php else: ?>
    <div class="table-wrap">
    <table>
        <tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr>
        <?php foreach ($orders as $o): ?>
        <tr>
            <td class="mono"><?php echo h($o['order_number']); ?></td>
            <td class="text-soft"><?php echo date('d M Y', strtotime($o['created_at'])); ?></td>
            <td><?php echo h($o['customer_name']); ?></td>
            <td class="mono"><?php echo format_price($o['total']); ?></td>
            <td><span class="badge-status badge-<?php echo h($o['payment_status']); ?>"><?php echo h($o['payment_status']); ?></span></td>
            <td><span class="badge-status badge-<?php echo h($o['status']); ?>"><?php echo h($o['status']); ?></span></td>
            <td style="white-space:nowrap;">
                <a href="order-detail.php?id=<?php echo (int)$o['id']; ?>" class="btn btn-outline btn-sm">View</a>
                <form method="POST" action="order-delete.php" style="display:inline;" onsubmit="return confirm('Delete this order permanently? If stock was deducted, it will be restored first.');">
                    <input type="hidden" name="order_id" value="<?php echo (int)$o['id']; ?>">
                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/admin-footer.php'; ?>
