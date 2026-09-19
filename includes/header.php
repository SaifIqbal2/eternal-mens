<?php
// Start the session (used for the cart) if not already started.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cart item count, shown as a badge on the cart icon.
$cart_count = 0;
if (!empty($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $line) {
        $cart_count += $line['quantity'];
    }
}

// Figure out the base URL so links work whether this page is in
// the root folder or a subfolder like /admin.
$base = (strpos($_SERVER['PHP_SELF'], '/admin/') !== false) ? '..' : '.';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? h($page_title) . ' | Eternal Mens' : 'Eternal Mens — Watches & Men\'s Accessories'; ?></title>
    <meta name="description" content="<?php echo isset($page_description) ? h($page_description) : "Precision timepieces and men's accessories, designed for the modern man."; ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo $base; ?>/assets/css/style.css?v=<?php echo @filemtime(__DIR__ . '/../assets/css/style.css') ?: time(); ?>">
</head>
<body>
<div id="toast" class="toast" role="status" aria-live="polite"></div>

<header class="site-header">
    <div class="container header-inner">

        <a href="<?php echo $base; ?>/index.php" class="logo">
            <img src="<?php echo $base; ?>/assets/images/logo.png" alt="Eternal Mens" class="logo-mark">
            <span>ETERNAL MENS</span>
        </a>

        <nav class="main-nav" id="mainNav">
            <a href="<?php echo $base; ?>/index.php">Home</a>
            <a href="<?php echo $base; ?>/collection.php?section=watches">Watches</a>
            <!-- <a href="<?php echo $base; ?>/new-arrivals.php">New Arrivals</a>
            <a href="<?php echo $base; ?>/best-sellers.php">Best Sellers</a> -->
            <a href="<?php echo $base; ?>/collection.php?section=accessories">Accessories</a>
            <a href="<?php echo $base; ?>/about.php">About Us</a>
            <a href="<?php echo $base; ?>/contact.php">Contact Us</a>
        </nav>

        <div class="header-icons">
            <a href="<?php echo $base; ?>/cart.php" class="icon-link cart-link" aria-label="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <span class="cart-badge" id="cartBadge" style="<?php echo $cart_count > 0 ? '' : 'display:none;'; ?>"><?php echo $cart_count; ?></span>
            </a>
            <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">☰</button>
        </div>
    </div>
</header>

<main>