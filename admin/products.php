<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
require_once 'includes/product-card.php';

$slug = $_GET['slug'] ?? '';

$stmt = $pdo->prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.slug = ? AND p.status = 'ACTIVE'");
$stmt->execute([$slug]);
$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    $page_title = 'Product Not Found';
    require_once 'includes/header.php';
    echo '<section class="section text-center"><div class="container"><p>Sorry, we couldn\'t find that product.</p><a href="collection.php" class="btn btn-outline-dark" style="margin-top:1.5rem;">Browse All Products</a></div></section>';
    require_once 'includes/footer.php';
    exit;
}

// ---- Handle review submission ----
$review_submitted = false;
$review_errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_review'])) {
    $author_name = trim($_POST['author_name'] ?? '');
    $rating = (int)($_POST['rating'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $body = trim($_POST['body'] ?? '');

    if ($author_name === '') $review_errors[] = 'Please enter your name.';
    if ($rating < 1 || $rating > 5) $review_errors[] = 'Please select a rating.';
    if ($body === '') $review_errors[] = 'Please write a review.';

    if (empty($review_errors)) {
        $stmt = $pdo->prepare("
            INSERT INTO reviews (product_id, author_name, rating, title, body, is_approved)
            VALUES (?, ?, ?, ?, ?, 0)
        ");
        $stmt->execute([$product['id'], $author_name, $rating, $title ?: null, $body]);
        header('Location: product.php?slug=' . urlencode($slug) . '&reviewed=1#reviews');
        exit;
    }
}
$review_submitted = isset($_GET['reviewed']);

// Images
$stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order");
$stmt->execute([$product['id']]);
$images = $stmt->fetchAll();
if (count($images) === 0) $images = [['url' => 'assets/images/placeholder.jpg', 'alt_text' => $product['name']]];

// Variants
$stmt = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1");
$stmt->execute([$product['id']]);
$variants = $stmt->fetchAll();

// Reviews
$stmt = $pdo->prepare("SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC");
$stmt->execute([$product['id']]);
$reviews = $stmt->fetchAll();
$avg_rating = count($reviews) > 0 ? array_sum(array_column($reviews, 'rating')) / count($reviews) : 0;

// Related products — same category, excluding this one
$stmt = $pdo->prepare("
    SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
    FROM products p
    WHERE p.category_id = ? AND p.id != ? AND p.status = 'ACTIVE'
    LIMIT 4
");
$stmt->execute([$product['category_id'], $product['id']]);
$related = $stmt->fetchAll();

// Recently viewed — tracked via a cookie of product IDs, newest first, max 4
$recently_viewed_ids = [];
if (!empty($_COOKIE['recently_viewed'])) {
    $recently_viewed_ids = array_filter(explode(',', $_COOKIE['recently_viewed']), 'is_numeric');
}
$recently_viewed_ids = array_diff($recently_viewed_ids, [$product['id']]); // remove current product if present
$recently_viewed = [];
if (count($recently_viewed_ids) > 0) {
    $placeholders = implode(',', array_fill(0, count($recently_viewed_ids), '?'));
    $stmt = $pdo->prepare("
        SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
        FROM products p WHERE p.id IN ($placeholders) AND p.status = 'ACTIVE'
    ");
    $stmt->execute(array_values($recently_viewed_ids));
    $recently_viewed = $stmt->fetchAll();
}
// Update the cookie: this product first, then up to 3 previous ones
$new_recent = array_slice(array_merge([$product['id']], array_values($recently_viewed_ids)), 0, 4);
setcookie('recently_viewed', implode(',', $new_recent), time() + 60 * 60 * 24 * 30, '/');

$page_title = $product['seo_title'] ?: $product['name'];
$page_description = $product['seo_description'] ?: mb_substr(strip_tags($product['description']), 0, 155);
$state = stock_state($product['stock'], $product['low_stock_threshold']);
$has_discount = $product['compare_at_price'] && $product['compare_at_price'] > $product['price'];
$discount_pct = $has_discount ? round((($product['compare_at_price'] - $product['price']) / $product['compare_at_price']) * 100) : 0;

require_once 'includes/header.php';
?>

<section class="section" style="padding-top: 2.5rem;">
    <div class="container">
        <p style="font-size:0.8rem; color:var(--graphite-soft); margin-bottom:2rem;">
            <a href="index.php" style="color:var(--graphite-soft);">Home</a> /
            <a href="collection.php?category=<?php echo h($product['category_slug']); ?>" style="color:var(--graphite-soft);"><?php echo h($product['category_name']); ?></a> /
            <?php echo h($product['name']); ?>
        </p>

        <div class="product-detail-layout">
            <!-- Gallery -->
            <div>
                <div class="product-main-image">
                    <img src="<?php echo h($images[0]['url']); ?>" alt="<?php echo h($product['name']); ?>" id="mainImage">
                </div>
                <?php if (count($images) > 1): ?>
                <div class="product-thumbs">
                    <?php foreach ($images as $i => $img): ?>
                        <button type="button" class="thumb-btn" onclick="document.getElementById('mainImage').src='<?php echo h($img['url']); ?>'">
                            <img src="<?php echo h($img['url']); ?>" alt="">
                        </button>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

            <!-- Info -->
            <div>
                <p class="section-eyebrow" style="margin-bottom:0.5rem;"><?php echo h($product['brand']); ?></p>
                <h1 style="font-family:var(--font-display); font-size:2rem;"><?php echo h($product['name']); ?></h1>

                <?php if (count($reviews) > 0): ?>
                <p class="mono" style="color:var(--brass); margin-top:0.5rem; font-size:0.85rem;">
                    <?php echo str_repeat('★', round($avg_rating)) . str_repeat('☆', 5 - round($avg_rating)); ?>
                    (<?php echo count($reviews); ?> review<?php echo count($reviews) === 1 ? '' : 's'; ?>)
                </p>
                <?php endif; ?>

                <div style="margin-top:1.25rem; display:flex; align-items:baseline; gap:0.75rem;">
                    <span class="mono" style="font-size:1.5rem;" id="displayPrice"><?php echo format_price($product['price']); ?></span>
                    <?php if ($has_discount): ?>
                        <span class="mono price-compare" style="font-size:1rem;"><?php echo format_price($product['compare_at_price']); ?></span>
                        <span class="badge" style="position:static;">-<?php echo $discount_pct; ?>%</span>
                    <?php endif; ?>
                </div>

                <p id="stockLabel" style="margin-top:0.75rem; font-size:0.85rem; <?php echo $state === 'LOW_STOCK' ? 'color:var(--brass);' : ($state === 'OUT_OF_STOCK' ? 'color:var(--danger);' : 'color:var(--success);'); ?>">
                    <?php echo stock_label($product['stock'], $product['low_stock_threshold']); ?>
                </p>

                <p style="margin-top:1.5rem; color:var(--graphite); line-height:1.7;"><?php echo nl2br(h($product['description'])); ?></p>

                <form method="POST" action="cart-action.php" style="margin-top:2rem;">
                    <input type="hidden" name="action" value="add">
                    <input type="hidden" name="product_id" value="<?php echo (int)$product['id']; ?>">
                    <input type="hidden" name="redirect" value="product.php?slug=<?php echo h($product['slug']); ?>">

                    <?php if (count($variants) > 0): ?>
                    <div class="form-group">
                        <label>Color</label>
                        <select name="variant_id" id="variantSelect" onchange="updateVariant(this)">
                            <?php foreach ($variants as $v): ?>
                                <option value="<?php echo (int)$v['id']; ?>"
                                    data-stock="<?php echo (int)$v['stock']; ?>"
                                    data-price="<?php echo $v['price_override'] ?? $product['price']; ?>"
                                    <?php echo $v['stock'] <= 0 ? 'disabled' : ''; ?>>
                                    <?php echo h($v['name']); ?><?php echo $v['stock'] <= 0 ? ' (Out of Stock)' : ''; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <?php endif; ?>

                    <div class="form-group" style="max-width:140px;">
                        <label>Quantity</label>
                        <input type="number" name="quantity" value="1" min="1" max="<?php echo (int)$product['stock']; ?>">
                    </div>

                    <div style="display:flex; gap:1rem; margin-top:1rem;">
                        <button type="submit" class="btn btn-outline-dark" style="flex:1;" <?php echo $state === 'OUT_OF_STOCK' ? 'disabled' : ''; ?>>Add to Cart</button>
                        <button type="submit" formaction="cart-action.php" class="btn btn-primary buy-now-btn" onclick="this.form.redirect.value='checkout.php'" style="flex:1;" <?php echo $state === 'OUT_OF_STOCK' ? 'disabled' : ''; ?>>Buy Now</button>
                    </div>
                </form>

                <div style="margin-top:2.5rem; border-top:1px solid var(--hairline); padding-top:1.5rem; font-size:0.85rem; color:var(--graphite);">
                    <?php if ($product['materials']): ?><p style="margin-bottom:0.5rem;"><strong>Materials:</strong> <?php echo h($product['materials']); ?></p><?php endif; ?>
                    <?php if ($product['dimensions']): ?><p style="margin-bottom:0.5rem;"><strong>Dimensions:</strong> <?php echo h($product['dimensions']); ?></p><?php endif; ?>
                    <?php if ($product['weight']): ?><p style="margin-bottom:0.5rem;"><strong>Weight:</strong> <?php echo h($product['weight']); ?></p><?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="section section-muted" id="reviews">
    <div class="container">
        <h2 class="section-heading">Customer Reviews</h2>

        <?php if ($review_submitted): ?>
            <div style="background:#eaf4ee; border:1px solid var(--success); color:var(--success); padding:1rem 1.25rem; margin-bottom:2rem; font-size:0.9rem;">
                Thanks for your review! It has been submitted and will appear after approval.
            </div>
        <?php endif; ?>

        <?php if (!empty($review_errors)): ?>
            <div style="background:#fbeaea; border:1px solid var(--danger); color:var(--danger); padding:1rem 1.25rem; margin-bottom:2rem; font-size:0.9rem;">
                <?php foreach ($review_errors as $e): ?><p><?php echo h($e); ?></p><?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (count($reviews) > 0): ?>
        <div class="review-grid" style="margin-bottom:2.5rem;">
            <?php foreach ($reviews as $r): ?>
                <div class="review-card">
                    <div class="review-stars"><?php echo str_repeat('★', $r['rating']) . str_repeat('☆', 5 - $r['rating']); ?></div>
                    <?php if ($r['title']): ?><p style="font-weight:600; margin-bottom:0.4rem;"><?php echo h($r['title']); ?></p><?php endif; ?>
                    <p><?php echo h($r['body']); ?></p>
                    <p class="review-author"><?php echo h($r['author_name']); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <div style="max-width:500px; border:1px solid var(--hairline); padding:1.75rem; background:var(--bone);">
            <h3 style="font-family:var(--font-display); font-size:1.2rem; margin-bottom:1.25rem;">Write a Review</h3>
            <form method="POST" action="product.php?slug=<?php echo h($slug); ?>#reviews">
                <div class="form-group">
                    <label>Your Rating</label>
                    <select name="rating" required>
                        <option value="">Select a rating</option>
                        <option value="5">★★★★★ Excellent</option>
                        <option value="4">★★★★☆ Good</option>
                        <option value="3">★★★☆☆ Average</option>
                        <option value="2">★★☆☆☆ Below Average</option>
                        <option value="1">★☆☆☆☆ Poor</option>
                    </select>
                </div>
                <div class="form-group"><label>Your Name</label><input type="text" name="author_name" required></div>
                <div class="form-group"><label>Review Title (optional)</label><input type="text" name="title"></div>
                <div class="form-group"><label>Your Review</label><textarea name="body" rows="4" required></textarea></div>
                <button type="submit" name="submit_review" value="1" class="btn btn-outline-dark">Submit Review</button>
            </form>
        </div>
    </div>
</section>

<?php if (count($related) > 0): ?>
<section class="section">
    <div class="container">
        <h2 class="section-heading">You Might Also Like</h2>
        <div class="product-grid">
            <?php foreach ($related as $p) render_product_card($p); ?>
        </div>
    </div>
</section>
<?php endif; ?>

<?php if (count($recently_viewed) > 0): ?>
<section class="section section-muted">
    <div class="container">
        <h2 class="section-heading">Recently Viewed</h2>
        <div class="product-grid">
            <?php foreach ($recently_viewed as $p) render_product_card($p); ?>
        </div>
    </div>
</section>
<?php endif; ?>

<style>
.product-detail-layout { display:grid; grid-template-columns: 1fr; gap: 3rem; }
@media (min-width: 900px) { .product-detail-layout { grid-template-columns: 1.1fr 1fr; } }
.product-main-image { aspect-ratio: 1/1; overflow:hidden; background:var(--hairline); }
.product-main-image img { width:100%; height:100%; object-fit:cover; }
.product-thumbs { display:flex; gap:0.75rem; margin-top:0.75rem; }
.thumb-btn { width:70px; height:70px; overflow:hidden; border:1px solid var(--hairline); background:none; padding:0; }
.thumb-btn img { width:100%; height:100%; object-fit:cover; }
</style>

<script>
function updateVariant(select) {
    var opt = select.options[select.selectedIndex];
    var stock = parseInt(opt.dataset.stock, 10);
    var price = parseFloat(opt.dataset.price);
    document.getElementById('displayPrice').textContent = 'Rs ' + Math.round(price).toLocaleString();
    var qtyInput = document.querySelector('input[name="quantity"]');
    if (qtyInput) qtyInput.max = stock;
    var stockLabel = document.getElementById('stockLabel');
    if (stock <= 0) stockLabel.textContent = 'Out of Stock';
    else if (stock <= <?php echo (int)$product['low_stock_threshold']; ?>) stockLabel.textContent = 'Only ' + stock + ' left';
    else stockLabel.textContent = 'In Stock';
}
</script>

<?php require_once 'includes/footer.php'; ?>
