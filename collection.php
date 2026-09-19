<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';
require_once 'includes/product-card.php';

// ---- Read filters from the URL ----
$category_slug = $_GET['category'] ?? '';
$search        = trim($_GET['q'] ?? '');
$sort          = $_GET['sort'] ?? 'newest';
$min_price     = isset($_GET['min_price']) && $_GET['min_price'] !== '' ? (float)$_GET['min_price'] : null;
$max_price     = isset($_GET['max_price']) && $_GET['max_price'] !== '' ? (float)$_GET['max_price'] : null;
$in_stock_only = isset($_GET['in_stock']);

// ---- All active categories (both sections) ----
$all_categories = $pdo->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order")->fetchAll();

$current_category = null;
foreach ($all_categories as $c) {
    if ($c['slug'] === $category_slug) { $current_category = $c; break; }
}

// ---- Work out which section we're in: "watches" or "accessories" ----
// Explicit ?section= wins. Otherwise, if a specific category was picked,
// its own section applies. Otherwise default to accessories (the
// Watches nav link always passes ?section=watches explicitly).
$section = $_GET['section'] ?? '';
if ($section !== 'watches' && $section !== 'accessories') {
    $section = $current_category ? $current_category['section'] : 'accessories';
}

// Category dropdown only shows categories belonging to this section —
// this is what keeps "Smart Watch" out of the Accessories filter and
// "Wallets" out of the Watches filter.
$section_categories = array_values(array_filter($all_categories, function ($c) use ($section) {
    return $c['section'] === $section;
}));

// If the selected category doesn't actually belong to this section
// (e.g. a stale/hand-edited URL), ignore it rather than showing the
// wrong products.
if ($current_category && $current_category['section'] !== $section) {
    $current_category = null;
    $category_slug = '';
}

// ---- Build the product query dynamically based on filters ----
$where = ["p.status = 'ACTIVE'"];
$params = [];

if ($current_category) {
    $where[] = "p.category_id = ?";
    $params[] = $current_category['id'];
} else {
    // No specific category chosen — stay within the current section
    // (all watch types, or all accessory types) rather than showing everything.
    $section_ids = array_column($section_categories, 'id');
    if (count($section_ids) > 0) {
        $placeholders = implode(',', array_fill(0, count($section_ids), '?'));
        $where[] = "p.category_id IN ($placeholders)";
        $params = array_merge($params, $section_ids);
    } else {
        // No active categories in this section at all yet
        $where[] = "1 = 0";
    }
}
if ($search !== '') {
    $where[] = "(p.name LIKE ? OR p.description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($min_price !== null) {
    $where[] = "p.price >= ?";
    $params[] = $min_price;
}
if ($max_price !== null) {
    $where[] = "p.price <= ?";
    $params[] = $max_price;
}
if ($in_stock_only) {
    $where[] = "p.stock > 0";
}

$order_by = "p.created_at DESC"; // newest (default)
if ($sort === 'price_asc') $order_by = "p.price ASC";
if ($sort === 'price_desc') $order_by = "p.price DESC";
if ($sort === 'bestselling') $order_by = "sold DESC";

$sql = "
    SELECT p.*,
           (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image,
           (SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi WHERE oi.product_id = p.id) AS sold
    FROM products p
    WHERE " . implode(' AND ', $where) . "
    ORDER BY $order_by
";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

$section_label = $section === 'watches' ? 'Watches' : 'Accessories';
$page_title = $current_category ? $current_category['name'] : $section_label;
require_once 'includes/header.php';

// Helper to keep existing filters when building sort/pagination links
function query_with(array $overrides) {
    $params = array_merge($_GET, $overrides);
    return '?' . http_build_query($params);
}
?>

<section class="section" style="padding-top: 3rem;">
    <div class="container">
        <p class="section-eyebrow"><?php echo count($products); ?> Products</p>
        <h1 class="section-heading" style="margin-bottom: 2rem;">
            <?php echo h($current_category ? $current_category['name'] : $section_label); ?>
        </h1>

        <div style="display:grid; grid-template-columns: 1fr; gap: 2.5rem;" class="collection-layout">
            <!-- Filters -->
            <aside style="max-width: 260px;">
                <form method="GET" action="collection.php">
                    <input type="hidden" name="section" value="<?php echo h($section); ?>">

                    <div class="form-group">
                        <label>Search</label>
                        <input type="text" name="q" value="<?php echo h($search); ?>" placeholder="Search products...">
                    </div>

                    <div class="form-group">
                        <label><?php echo $section === 'watches' ? 'Watch Type' : 'Category'; ?></label>
                        <select name="category" onchange="this.form.submit()">
                            <option value="">All <?php echo h($section_label); ?></option>
                            <?php foreach ($section_categories as $c): ?>
                                <option value="<?php echo h($c['slug']); ?>" <?php echo $c['slug'] === $category_slug ? 'selected' : ''; ?>>
                                    <?php echo h($c['name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Price Range (Rs)</label>
                        <div style="display:flex; gap:0.5rem;">
                            <input type="number" name="min_price" value="<?php echo h($min_price ?? ''); ?>" placeholder="Min">
                            <input type="number" name="max_price" value="<?php echo h($max_price ?? ''); ?>" placeholder="Max">
                        </div>
                    </div>

                    <div class="form-group" style="display:flex; align-items:center; gap:0.5rem;">
                        <input type="checkbox" name="in_stock" id="in_stock" style="width:auto;" <?php echo $in_stock_only ? 'checked' : ''; ?>>
                        <label for="in_stock" style="margin:0;">In Stock Only</label>
                    </div>

                    <button type="submit" class="btn btn-outline-dark btn-block">Apply Filters</button>
                    <div style="margin-top: 0.75rem; text-align:center;">
                        <a href="collection.php?section=<?php echo h($section); ?>" style="font-size:0.8rem; color: var(--graphite-soft);">Clear filters</a>
                    </div>
                </form>
            </aside>

            <!-- Products -->
            <div>
                <div style="display:flex; justify-content:flex-end; margin-bottom: 1.5rem;">
                    <form method="GET" action="collection.php" id="sortForm">
                        <?php foreach ($_GET as $k => $v): if ($k === 'sort') continue; ?>
                            <input type="hidden" name="<?php echo h($k); ?>" value="<?php echo h($v); ?>">
                        <?php endforeach; ?>
                        <select name="sort" onchange="document.getElementById('sortForm').submit()">
                            <option value="newest" <?php echo $sort === 'newest' ? 'selected' : ''; ?>>Newest</option>
                            <option value="bestselling" <?php echo $sort === 'bestselling' ? 'selected' : ''; ?>>Best Selling</option>
                            <option value="price_asc" <?php echo $sort === 'price_asc' ? 'selected' : ''; ?>>Price: Low to High</option>
                            <option value="price_desc" <?php echo $sort === 'price_desc' ? 'selected' : ''; ?>>Price: High to Low</option>
                        </select>
                    </form>
                </div>

                <?php if (count($products) === 0): ?>
                    <div class="empty-state">
                        <h1>Coming Soon!</h1>
                        <a href="collection.php?section=<?php echo h($section); ?>" class="btn btn-outline-dark" style="margin-top:1rem;">Clear Filters</a>
                    </div>
                <?php else: ?>
                    <div class="product-grid">
                        <?php foreach ($products as $p) render_product_card($p); ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<style>
@media (min-width: 900px) {
    .collection-layout { grid-template-columns: 260px 1fr !important; }
}
</style>

<?php require_once 'includes/footer.php'; ?>
