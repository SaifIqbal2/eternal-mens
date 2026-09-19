<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
$page_title = 'FAQ';
require_once 'includes/header.php';

$faqs = [
    ['q' => 'How long does delivery take?', 'a' => 'Orders typically arrive in 5-7 business days after dispatch. You\'ll get tracking details by email once your order ships.'],
    ['q' => 'What payment methods do you accept?', 'a' => 'Cash on Delivery and Bank Transfer are available at checkout. Online card payments are coming soon.'],
    ['q' => 'Can I return or exchange an item?', 'a' => 'Yes — we offer a 14-day return window from the day you receive your order. See our Returns & Exchange page for the full policy.'],
    ['q' => 'How do I track my order?', 'a' => 'Use the Order Tracking page with your order number and the email you used at checkout.'],
    ['q' => 'Do you ship internationally?', 'a' => 'Not yet — we currently ship within Pakistan only. International shipping is on our roadmap.'],
];
?>
<section class="section" style="padding-top:2.5rem;">
    <div class="container" style="max-width:720px;">
        <p class="section-eyebrow">Help</p>
        <h1 class="section-heading">Frequently Asked Questions</h1>
        <div>
            <?php foreach ($faqs as $f): ?>
                <div style="border-bottom:1px solid var(--hairline); padding:1.5rem 0;">
                    <h3 style="font-size:1rem; margin-bottom:0.6rem;"><?php echo h($f['q']); ?></h3>
                    <p style="color:var(--graphite); font-size:0.9rem; line-height:1.6;"><?php echo h($f['a']); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
