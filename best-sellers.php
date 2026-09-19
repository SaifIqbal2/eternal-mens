<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
require_once 'includes/product-card.php';
require_once 'includes/bestseller-row.php';

$stmt = $pdo->prepare("
    SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image,
           COALESCE(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    WHERE p.status = 'ACTIVE'
    GROUP BY p.id
    ORDER BY p.is_bestseller DESC, sold DESC, p.created_at DESC
");
$stmt->execute();
$products = $stmt->fetchAll();

$page_title = 'Best Sellers';
require_once 'includes/header.php';
?>
<section class="section" style="padding-top: 3rem;">
    <div class="container">
        <p class="section-eyebrow">Best Sellers</p>
        <h1 class="section-heading">What Everyone's Wearing</h1>
        <?php if (count($products) === 0): ?>
            <div class="empty-state"><p>No products yet — check back soon.</p></div>
        <?php else: ?>
            <div class="bestseller-list" style="max-width:900px;">
                <?php foreach ($products as $i => $p) render_bestseller_row($p, $i + 1, false); ?>
            </div>
        <?php endif; ?>
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>
