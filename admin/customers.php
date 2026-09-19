<?php
require_once 'includes/auth.php';

// Checkout is guest-only, so this page shows buyers created from guest orders.
$guests = $pdo->query("
    SELECT customer_email AS email, customer_name AS name, customer_phone AS phone,
           COUNT(*) AS order_count, SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END) AS total_spent,
           MAX(created_at) AS last_order_at
    FROM orders
    WHERE customer_id IS NULL
    GROUP BY customer_email, customer_name, customer_phone
    ORDER BY last_order_at DESC
")->fetchAll();

$page_title = 'Customers';
$active_nav = 'customers';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['deleted'])): ?><div class="alert alert-success">Customer and their guest orders were deleted successfully.</div><?php endif; ?>
<?php if (isset($_GET['delete_error'])): ?><div class="alert alert-danger">Could not delete the customer. Please try again.</div><?php endif; ?>

<div class="panel">
    <h2>Customers <span class="text-soft" style="font-weight:400;"></span></h2>

    <?php if (count($guests) === 0): ?>
        <div class="empty">No guest customers yet.</div>
    <?php else: ?>
    <div class="table-wrap">
    <table>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Last Order</th><th></th></tr>
        <?php foreach ($guests as $g): ?>
        <tr>
            <td><?php echo h($g['name']); ?></td>
            <td><?php echo h($g['email']); ?></td>
            <td><?php echo h($g['phone']); ?></td>
            <td><?php echo (int)$g['order_count']; ?></td>
            <td class="mono"><?php echo format_price($g['total_spent']); ?></td>
            <td class="text-soft"><?php echo date('d M Y', strtotime($g['last_order_at'])); ?></td>
            <td style="white-space:nowrap;">
                <form method="POST" action="customer-delete.php" style="display:inline;" onsubmit="return confirm('Delete this customer and all of their guest orders? This cannot be undone.');">
                    <input type="hidden" name="email" value="<?php echo h($g['email']); ?>">
                    <input type="hidden" name="name" value="<?php echo h($g['name']); ?>">
                    <input type="hidden" name="phone" value="<?php echo h($g['phone']); ?>">
                </form>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/admin-footer.php'; ?>
