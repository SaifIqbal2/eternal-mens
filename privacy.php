<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
$page_title = 'Privacy Policy';
require_once 'includes/header.php';
?>
<section class="section" style="padding-top:2.5rem;">
    <div class="container" style="max-width:720px;">
        <p class="section-eyebrow">Legal</p>
        <h1 class="section-heading">Privacy Policy</h1>
        <div style="color:var(--graphite); line-height:1.8;">
            <p>Last updated: <?php echo date('F Y'); ?></p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Information We Collect</h3>
            <p>When you place an order, we collect your name, email, phone number, and shipping address to process and deliver your order. When you subscribe to our newsletter, we collect your email address.</p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">How We Use Your Information</h3>
            <p>We use your information solely to process orders, provide customer support. We do not sell your information to third parties.</p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Data Security</h3>
            <p>Your information is stored securely and access is limited to what's needed to fulfill your order.</p>

            <h3 style="margin-top:1.5rem; margin-bottom:0.5rem; color:var(--ink);">Your Rights</h3>
            <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
