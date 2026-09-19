</main>

<footer class="site-footer">
    <div class="container footer-grid">

        <div class="footer-brand">
            <span class="footer-wordmark">ETERNAL MENS</span>
            <p>Timepieces and accessories built for the modern man.</p>

        </div>

        

        <nav class="footer-col">
            <a href="<?php echo $base; ?>/collection.php?section=watches">Watches</a>
            <a href="<?php echo $base; ?>/collection.php?section=accessories">Accessories</a>
            <a href="<?php echo $base; ?>/new-arrivals.php">New Arrivals</a>
            <a href="<?php echo $base; ?>/best-sellers.php">Best Sellers</a>
            <a href="<?php echo $base; ?>/order-tracking.php">Order Tracking</a>
            <!-- <a href="<?php echo $base; ?>/returns.php">Exchange &amp; Returns</a> -->
            <a href="<?php echo $base; ?>/shipping.php">Shipping &amp; Deliveries</a>
        </nav>

        <nav class="footer-col">
            <a href="<?php echo $base; ?>/about.php">About Us</a>
            <a href="<?php echo $base; ?>/contact.php">Contact Us</a>
            <a href="<?php echo $base; ?>/faq.php">FAQ</a>
            <!-- <a href="<?php echo $base; ?>/privacy.php">Privacy Policy</a> -->
            <a href="<?php echo $base; ?>/terms.php">Terms &amp; Conditions</a>
            <!-- <a href="#">Instagram</a> -->
        </nav>

    </div>

    <div class="footer-bottom">
        <div class="container footer-bottom-inner">
            <span>&copy; Copyrights Reserved by Eternal Mens <?php echo date('Y'); ?></span>
        </div>
    </div>
</footer>

<script src="<?php echo $base; ?>/assets/js/main.js?v=<?php echo @filemtime(__DIR__ . '/../assets/js/main.js') ?: time(); ?>"></script>
</body>
</html>