<?php
// Expects $page_title and optionally $active_nav to be set before including this.
$active_nav = $active_nav ?? '';
$unread_messages_count = $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo h($page_title ?? 'Dashboard'); ?> | Eternal Mens Admin</title>
    <link rel="stylesheet" href="../assets/css/admin.css?v=<?php echo @filemtime(__DIR__ . '/../../assets/css/admin.css') ?: time(); ?>">
</head>
<body>
<div class="admin-shell">
    <aside class="admin-sidebar">
        <div class="brand">ETERNAL MENS ADMIN</div>
        <nav>
            <a href="index.php" class="<?php echo $active_nav === 'dashboard' ? 'active' : ''; ?>">Dashboard</a>
            <a href="products.php" class="<?php echo $active_nav === 'products' ? 'active' : ''; ?>">Products</a>
            <a href="inventory.php" class="<?php echo $active_nav === 'inventory' ? 'active' : ''; ?>">Inventory</a>
            <a href="orders.php" class="<?php echo $active_nav === 'orders' ? 'active' : ''; ?>">Orders</a>
            <a href="customers.php" class="<?php echo $active_nav === 'customers' ? 'active' : ''; ?>">Customers</a>
            <a href="discounts.php" class="<?php echo $active_nav === 'discounts' ? 'active' : ''; ?>">Discounts</a>
            <a href="reviews.php" class="<?php echo $active_nav === 'reviews' ? 'active' : ''; ?>">Reviews</a>
            <a href="categories.php" class="<?php echo $active_nav === 'categories' ? 'active' : ''; ?>">Categories</a>
            <a href="messages.php" class="<?php echo $active_nav === 'messages' ? 'active' : ''; ?>">Messages<?php if ($unread_messages_count > 0): ?> <span class="badge-status badge-PENDING" style="margin-left:4px;"><?php echo $unread_messages_count; ?></span><?php endif; ?></a>
        </nav>
        <div class="logout">
            <a href="logout.php" style="color:rgba(255,255,255,0.7);">Log Out (<?php echo h($current_admin['name']); ?>)</a>
        </div>
    </aside>

    <div class="admin-main">
        <div class="admin-topbar">
            <h1><?php echo h($page_title ?? 'Dashboard'); ?></h1>
            <a href="../index.php" target="_blank" class="btn btn-outline btn-sm">View Store →</a>
        </div>
        <div class="admin-content">
