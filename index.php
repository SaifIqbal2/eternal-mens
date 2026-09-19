<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';

$page_title = 'Home';

// Featured products
$stmt = $pdo->prepare("
    SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
    FROM products p
    WHERE p.status = 'ACTIVE' AND p.is_featured = 1
    ORDER BY p.created_at DESC
    LIMIT 8
");
$stmt->execute();
$featured = $stmt->fetchAll();

// New arrivals
$stmt = $pdo->prepare("
    SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
    FROM products p
    WHERE p.status = 'ACTIVE'
    ORDER BY p.created_at DESC
    LIMIT 8
");
$stmt->execute();
$new_arrivals = $stmt->fetchAll();


$stmt = $pdo->prepare("
    SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image,
           COALESCE(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    WHERE p.status = 'ACTIVE' AND (p.is_bestseller = 1 OR EXISTS (
        SELECT 1 FROM order_items oi2 WHERE oi2.product_id = p.id
    ))
    GROUP BY p.id
    ORDER BY p.is_bestseller DESC, sold DESC, p.created_at DESC
    LIMIT 8
");
$stmt->execute();
$best_sellers = $stmt->fetchAll();

// Homepage orbits: Watches is a standalone link to the Watches page,
// followed by the active Accessories categories. Watches is NOT an accessory category.
$nav_categories = [
    [
        'name' => 'Watches',
        'slug' => 'watches',
        'image' => 'assets/images/categories/watches.jpg',
        'link' => 'collection.php?section=watches',
    ],
];

$stmt = $pdo->prepare("SELECT * FROM categories WHERE is_active = 1 AND section = 'accessories' ORDER BY sort_order");
$stmt->execute();
$accessory_categories = $stmt->fetchAll();

foreach ($accessory_categories as $cat) {
    $cat['link'] = 'collection.php?category=' . $cat['slug'];
    $nav_categories[] = $cat;
}

require_once 'includes/product-card.php';
require_once 'includes/bestseller-row.php';
require_once 'includes/header.php';
?>

<!-- hero -->
<section class="hero">
    <img src="assets/images/hero.jpeg" alt="Meridian chronograph watch on a dark surface" class="hero-bg">

    <div class="hero-overlay"></div>

    <div class="container hero-content">
        <p class="eyebrow">Eternal Mens — Timepieces</p>

        <h1>Time,<br><em>Redefined.</em></h1>

        <p class="hero-description">
            Precision movements, considered detail, and materials built to outlast trend cycles.
        </p>

        <div class="hero-actions">
            <a href="collection.php?section=watches" class="btn btn-light">Shop Watches</a>
        </div>
    </div>

    <div class="hero-meta">
        <span class="hero-meta-line"></span>
        <span>ETERNAL MENS</span>
    </div>

    <div class="hero-scroll">
        <span>Scroll to explore</span>
        <span class="hero-scroll-line"></span>
    </div>
</section>

<!-- secction orbit -->
<section class="section category-orbits-section reveal">
    <div class="container">
        <p class="section-eyebrow text-center">Shop by Category</p>
        <h2 class="section-heading text-center">Find Your Piece</h2>
        <div class="category-orbits">
            <?php foreach ($nav_categories as $cat): ?>
                <a href="<?php echo h($cat['link'] ?? ('collection.php?category=' . $cat['slug'])); ?>" class="category-orb">
                    <span class="category-orb-visual" style="position:relative; display:block; width:180px; height:180px;">
                        <svg class="orb-arc orb-arc-1" viewBox="0 0 160 160" width="180" height="180" aria-hidden="true" style="position:absolute; inset:0; width:100%; height:100%; fill:none;">
                            <path d="M 19.6 106.5 A 66 66 0 0 1 106.5 19.6" fill="none" stroke="#a67c3d" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <svg class="orb-arc orb-arc-2" viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" style="position:absolute; inset:0; width:100%; height:100%; fill:none;">
                            <path d="M 140.4 53.5 A 66 66 0 0 1 53.5 140.4" fill="none" stroke="#a67c3d" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <span class="category-orb-image" style="position:absolute; inset:30px; border-radius:50%; overflow:hidden; display:block; background:#ddd9d1;">
                            <img src="<?php echo h($cat['image'] ?: 'assets/images/categories/' . $cat['slug'] . '.jpg'); ?>" alt="<?php echo h($cat['name']); ?>" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
                        </span>
                    </span>
                    <span class="category-orb-label"><?php echo h($cat['name']); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- section featured -->
<?php if (count($featured) > 0): ?>
<section class="section featured-editorial-section reveal">
    <div class="container">
        <div class="featured-editorial-heading">
            <div>
                <p class="section-eyebrow">Featured</p>
                <h2 class="section-heading">Selected Pieces</h2>
            </div>
            <span class="featured-counter"><strong id="featuredCurrent">01</strong> / <?php echo str_pad(count($featured), 2, '0', STR_PAD_LEFT); ?></span>
        </div>

        <div class="featured-editorial" id="featuredCarousel">
            <div class="featured-editorial-image">
                <?php foreach ($featured as $i => $p): ?>
                    <div class="featured-slide-image<?php echo $i === 0 ? ' is-active' : ''; ?>" data-featured-index="<?php echo $i; ?>">
                        <img src="<?php echo h($p['image'] ?: 'assets/images/placeholder.jpg'); ?>" alt="<?php echo h($p['name']); ?>">
                    </div>
                <?php endforeach; ?>
            </div>

            <div class="featured-editorial-info">
                <?php foreach ($featured as $i => $p): ?>
                    <div class="featured-slide-info<?php echo $i === 0 ? ' is-active' : ''; ?>" data-featured-index="<?php echo $i; ?>">
                        <p class="featured-piece-number"><?php echo str_pad($i + 1, 2, '0', STR_PAD_LEFT); ?></p>
                        <h3><?php echo h($p['name']); ?></h3>
                        <p class="featured-piece-copy">Precision in every detail. Designed to be worn, noticed, and remembered.</p>

                        <div class="featured-piece-bottom">
                            <span class="featured-piece-price"><?php echo format_price($p['price']); ?></span>
                            <a href="product.php?slug=<?php echo h($p['slug']); ?>" class="featured-piece-link">View Piece <span>→</span></a>
                        </div>
                    </div>
                <?php endforeach; ?>

                <div class="featured-navigation">
                    <button type="button" class="featured-nav-btn" id="featuredPrev" aria-label="Previous featured product">←</button>
                    <span class="featured-nav-line"><i id="featuredProgress"></i></span>
                    <button type="button" class="featured-nav-btn" id="featuredNext" aria-label="Next featured product">→</button>
                </div>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- sectiton best seller -->
<?php if (count($best_sellers) > 0): ?>
<section class="section reveal">
    <div class="container" style="max-width:900px;">
        <p class="section-eyebrow">Best Sellers</p>
        <h2 class="section-heading">What Everyone's Wearing</h2>
        <div class="bestseller-list">
            <?php foreach ($best_sellers as $i => $p) render_bestseller_row($p, $i + 1, true); ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- section new arrivals -->
<?php if (count($new_arrivals) > 0): ?>
<section class="new-arrivals-section reveal">
    <div class="new-arrivals-bg"></div>

    <div class="new-arrivals-panel">
        <div class="container">
            <div class="new-arrivals-header">
                <h2>New Arrivals</h2>
                <a href="<?php echo $base; ?>/new-arrivals.php" class="new-arrivals-all">
                    All Products <span>→</span>
                </a>
            </div>

            <div class="new-arrivals-line"></div>

            <div class="new-arrivals-carousel">
                <button type="button" class="new-arrivals-arrow new-arrivals-arrow-left" id="arrivalsPrev" aria-label="Previous products">
                    ←
                </button>

                <div class="new-arrivals-track" id="arrivalsCarousel">
                    <?php foreach ($new_arrivals as $i => $p): ?>
                        <div class="new-arrival-item">
                            <a href="product.php?slug=<?php echo h($p['slug']); ?>" class="new-arrival-image">
                                <img src="<?php echo h($p['image'] ?: 'assets/images/1.jpg'); ?>" alt="<?php echo h($p['name']); ?>">
                            </a>

                            <div class="new-arrival-info">
                                <div>
                                    <span class="new-arrival-number"><?php echo str_pad($i + 1, 2, '0', STR_PAD_LEFT); ?></span>
                                    <h3><?php echo h($p['name']); ?></h3>
                                </div>

                                <span class="new-arrival-price"><?php echo format_price($p['price']); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <button type="button" class="new-arrivals-arrow new-arrivals-arrow-right" id="arrivalsNext" aria-label="Next products">
                    →
                </button>
            </div>

            <div class="new-arrivals-footer">
                <span id="arrivalsCurrent">01</span>
                <span class="new-arrivals-progress">
                    <i id="arrivalsProgress"></i>
                </span>
                <span><?php echo str_pad(count($new_arrivals), 2, '0', STR_PAD_LEFT); ?></span>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- section brand statement -->
<section class="section section-dark reveal">
    <div class="container brand-statement">
        <div class="brand-statement-image">
            <img src="assets/images/brandS.jpeg" alt="Model wearing an Eternal Mens watch">
        </div>
        <div>
            <p class="section-eyebrow">Our Philosophy</p>
            <h2>Designed for the modern man.</h2>
            <p>Every piece we make is judged against three things: style that doesn't date, quality that holds up to daily wear, and the kind of detail you only notice up close.</p>
        </div>
    </div>
</section>

<!-- qualities -->
<section class="section reveal">
    <div class="container">
        <div class="trust-grid">
            <div class="trust-item">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M6 3h12l-1 12-5 4-5-4L6 3z"/></svg>
                <h3>Quality Products</h3>
                <p>Precision-built pieces, inspected before they ship.</p>
            </div>
            <div class="trust-item">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>
                <h3>Secure Payments</h3>
                <p>Your details are protected, every transaction.</p>
            </div>
            <div class="trust-item">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><rect x="1" y="6" width="15" height="12"/><path d="M16 10h4l3 3v5h-7"/></svg>
                <h3>Fast Delivery</h3>
                <p>Nationwide dispatch within 24–48 hours.</p>
            </div>
            <div class="trust-item">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M3 12a9 9 0 109-9"/><path d="M3 4v5h5"/></svg>
                <h3>Easy Returns</h3>
                <p>14-day hassle-free returns, no questions asked.</p>
            </div>
        </div>
    </div>
</section>

<!-- reviews -->
<section class="section reveal">
    <div class="container">
        <h2 class="section-heading">In Their Words</h2>
        <div class="review-grid">
            <div class="review-card">
                <div class="review-stars">★★★★★</div>
                <p>"The build quality is far beyond what I expected at this price. Strap feels premium too."</p>
                <p class="review-author">Ahmed R.</p>
            </div>
            <div class="review-card">
                <div class="review-stars">★★★★★</div>
                <p>"Fast delivery, and the packaging alone felt like unboxing something twice the price."</p>
                <p class="review-author">Bilal K.</p>
            </div>
            <div class="review-card">
                <div class="review-stars">★★★★☆</div>
                <p>"Exactly as described. Customer support was quick to answer my sizing question."</p>
                <p class="review-author">Hamza S.</p>
            </div>
        </div>
    </div>
</section>

<section class="section section-dark reveal">
    <div class="container newsletter">
        <h2>Join the List</h2>
        <p>New arrivals, early access, and the occasional private discount. No spam.</p>
        <form class="newsletter-form" action="includes/newsletter.php" method="POST">
            <input type="email" name="email" placeholder="Enter your email" required>
            <button type="submit" class="btn btn-light">Subscribe</button>
        </form>
        <?php if (isset($_GET['subscribed'])): ?>
            <p class="newsletter-message">You're on the list. Thanks for joining.</p>
        <?php endif; ?>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
