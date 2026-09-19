<?php
require_once 'includes/auth.php';

$today = date('Y-m-d');

$today_sales = $pdo->query("SELECT COALESCE(SUM(total),0) AS t FROM orders WHERE DATE(created_at) = '$today' AND status != 'CANCELLED'")->fetch()['t'];
$total_sales = $pdo->query("SELECT COALESCE(SUM(total),0) AS t FROM orders WHERE status != 'CANCELLED'")->fetch()['t'];
$today_orders = $pdo->query("SELECT COUNT(*) AS c FROM orders WHERE DATE(created_at) = '$today'")->fetch()['c'];
$total_orders = $pdo->query("SELECT COUNT(*) AS c FROM orders")->fetch()['c'];
$pending_orders = $pdo->query("SELECT COUNT(*) AS c FROM orders WHERE status = 'PENDING'")->fetch()['c'];
$products_in_stock = $pdo->query("SELECT COUNT(*) AS c FROM products WHERE stock > 0")->fetch()['c'];
$low_stock = $pdo->query("SELECT COUNT(*) AS c FROM products WHERE stock > 0 AND stock <= low_stock_threshold")->fetch()['c'];
$out_of_stock = $pdo->query("SELECT COUNT(*) AS c FROM products WHERE stock = 0")->fetch()['c'];
$total_customers = $pdo->query("SELECT COUNT(*) AS c FROM customers")->fetch()['c'];

$recent_orders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8")->fetchAll();
$low_stock_products = $pdo->query("SELECT * FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC LIMIT 8")->fetchAll();

$page_title = 'Dashboard';
$active_nav = 'dashboard';
require_once 'includes/admin-header.php';
?>

<div class="stat-grid">
    <div class="stat-card"><div class="label">Today's Sales</div><div class="value"><?php echo format_price($today_sales); ?></div></div>
    <div class="stat-card"><div class="label">Total Sales</div><div class="value"><?php echo format_price($total_sales); ?></div></div>
    <div class="stat-card"><div class="label">Today's Orders</div><div class="value"><?php echo $today_orders; ?></div></div>
    <div class="stat-card"><div class="label">Total Orders</div><div class="value"><?php echo $total_orders; ?></div></div>
    <div class="stat-card"><div class="label">Pending Orders</div><div class="value warn"><?php echo $pending_orders; ?></div></div>
    <div class="stat-card"><div class="label">Products In Stock</div><div class="value"><?php echo $products_in_stock; ?></div></div>
    <div class="stat-card"><div class="label">Low Stock</div><div class="value warn"><?php echo $low_stock; ?></div></div>
    <div class="stat-card"><div class="label">Out of Stock</div><div class="value danger"><?php echo $out_of_stock; ?></div></div>
</div>

<div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:1.5rem;" class="dash-grid">
    <div class="panel">
        <div class="flex-between" style="margin-bottom:1rem;">
            <h2 style="margin:0;">Recent Orders</h2>
            <a href="orders.php" class="btn btn-outline btn-sm">View All</a>
        </div>
        <?php if (count($recent_orders) === 0): ?>
            <div class="empty">No orders yet.</div>
        <?php else: ?>
        <div class="table-wrap">
        <table>
            <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr>
            <?php foreach ($recent_orders as $o): ?>
            <tr>
                <td class="mono"><?php echo h($o['order_number']); ?></td>
                <td><?php echo h($o['customer_name']); ?></td>
                <td class="mono"><?php echo format_price($o['total']); ?></td>
                <td><span class="badge-status badge-<?php echo h($o['status']); ?>"><?php echo h($o['status']); ?></span></td>
                <td><a href="order-detail.php?id=<?php echo (int)$o['id']; ?>" class="btn btn-outline btn-sm">View</a></td>
            </tr>
            <?php endforeach; ?>
        </table>
        </div>
        <?php endif; ?>
    </div>

    <div class="panel">
        <div class="flex-between" style="margin-bottom:1rem;">
            <h2 style="margin:0;">Low Stock Alerts</h2>
            <a href="inventory.php" class="btn btn-outline btn-sm">Manage</a>
        </div>
        <?php if (count($low_stock_products) === 0): ?>
            <div class="empty">All stocked up.</div>
        <?php else: ?>
            <?php foreach ($low_stock_products as $p): ?>
                <div class="flex-between" style="padding:0.6rem 0; border-bottom:1px solid var(--a-border);">
                    <div>
                        <div style="font-weight:500;"><?php echo h($p['name']); ?></div>
                        <div class="text-soft mono" style="font-size:0.75rem;"><?php echo h($p['sku']); ?></div>
                    </div>
                    <span class="badge-status badge-<?php echo $p['stock'] == 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'; ?>"><?php echo $p['stock'] == 0 ? 'Out' : $p['stock'] . ' left'; ?></span>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<style>
@media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
</style>

<?php require_once 'includes/admin-footer.php'; ?>
