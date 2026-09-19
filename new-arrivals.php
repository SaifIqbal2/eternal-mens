<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
require_once 'includes/product-card.php';

$stmt = $pdo->prepare("
    SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
    FROM products p
    WHERE p.status = 'ACTIVE'
    ORDER BY p.created_at DESC
");
$stmt->execute();
$products = $stmt->fetchAll();

$page_title = 'New Arrivals';
require_once 'includes/header.php';
?>
<section class="section" style="padding-top: 3rem;">
    <div class="container">
        <p class="section-eyebrow">Just In</p>
        <h1 class="section-heading">New Arrivals</h1>
        <?php if (count($products) === 0): ?>
            <div class="empty-state"><p>No products yet — check back soon.</p></div>
        <?php else: ?>
            <div class="product-grid">
                <?php foreach ($products as $p) render_product_card($p); ?>
            </div>
        <?php endif; ?>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
