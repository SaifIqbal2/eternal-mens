<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
$page_title = 'Shipping & Delivery';
require_once 'includes/header.php';
?>
<section class="section" style="padding-top:2.5rem;">
    <div class="container" style="max-width:720px;">
        <p class="section-eyebrow">Policy</p>
        <h1 class="section-heading">Shipping & Delivery</h1>
        <div style="color:var(--graphite); line-height:1.8;">
            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Delivery Times</h3>
            <p>Orders are dispatched within 24–48 hours of confirmation. Once shipped, delivery within Pakistan takes 5-7 business days depending on your city.</p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Shipping Cost</h3>
            <p>Free Delivery.</p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Order Tracking</h3>
            <p>Once your order ships, you can check its status anytime on our <a href="order-tracking.php" style="text-decoration:underline;">Order Tracking</a> page using your order number and email.</p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Delays</h3>
            <p>Occasionally weather or courier delays push delivery a day or two past the estimate. If your order is significantly delayed, contact us and we'll look into it right away.</p>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
