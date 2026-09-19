<?php
require_once 'includes/auth.php';

$product_id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$is_edit = $product_id !== null;

$product = [
    'name' => '', 'sku' => '', 'brand' => '', 'category_id' => '', 'description' => '',
    'materials' => '', 'dimensions' => '', 'weight' => '', 'price' => '', 'compare_at_price' => '',
    'cost_price' => '', 'stock' => 0, 'low_stock_threshold' => 5, 'allow_backorder' => 0,
    'status' => 'DRAFT', 'is_featured' => 0, 'is_bestseller' => 0, 'seo_title' => '', 'seo_description' => '',
];
$images = [];
$variants = [];

if ($is_edit) {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$product_id]);
    $found = $stmt->fetch();
    if (!$found) { header('Location: products.php'); exit; }
    $product = $found;

    $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order");
    $stmt->execute([$product_id]);
    $images = $stmt->fetchAll();

    $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY id");
    $stmt->execute([$product_id]);
    $variants = $stmt->fetchAll();
}

$categories = $pdo->query("SELECT * FROM categories ORDER BY section, sort_order")->fetchAll();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $sku = trim($_POST['sku']);
    $slug = slugify($name);
    $brand = trim($_POST['brand']);
    $category_id = (int)$_POST['category_id'];
    $description = trim($_POST['description']);
    $materials = trim($_POST['materials']);
    $dimensions = trim($_POST['dimensions']);
    $weight = trim($_POST['weight']);
    $price = (float)$_POST['price'];
    $compare_at_price = $_POST['compare_at_price'] !== '' ? (float)$_POST['compare_at_price'] : null;
    $cost_price = $_POST['cost_price'] !== '' ? (float)$_POST['cost_price'] : null;
    $stock = (int)$_POST['stock'];
    $low_stock_threshold = (int)$_POST['low_stock_threshold'];
    $allow_backorder = isset($_POST['allow_backorder']) ? 1 : 0;
    $status = $_POST['status'] === 'ACTIVE' ? 'ACTIVE' : 'DRAFT';
    $is_featured = isset($_POST['is_featured']) ? 1 : 0;
    $is_bestseller = isset($_POST['is_bestseller']) ? 1 : 0;

    if ($name === '') $errors[] = 'Product name is required.';
    if ($sku === '') $errors[] = 'SKU is required.';
    if (!$category_id) $errors[] = 'Category is required.';
    if ($price <= 0) $errors[] = 'Price must be greater than 0.';

    // Check SKU and slug uniqueness before saving.
    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT id FROM products WHERE sku = ? AND id != ?");
        $stmt->execute([$sku, $product_id ?? 0]);
        if ($stmt->fetch()) $errors[] = 'That SKU is already in use by another product.';
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT id FROM products WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $product_id ?? 0]);
        if ($stmt->fetch()) $errors[] = 'A product with this name already exists. Please choose a different product name.';
    }

    // Check submitted variant SKUs before making any database changes.
    if (empty($errors) && !empty($_POST['variant_name'])) {
        $seen_variant_skus = [];
        foreach ($_POST['variant_name'] as $i => $vname) {
            $vname = trim($vname);
            if ($vname === '') continue;

            $vsku = trim($_POST['variant_sku'][$i] ?? '');
            $vid = (int)($_POST['variant_id'][$i] ?? 0);

            if ($vsku === '') {
                $errors[] = 'Variant SKU is required for every variant.';
                continue;
            }

            $sku_key = strtolower($vsku);
            if (isset($seen_variant_skus[$sku_key])) {
                $errors[] = 'Each variant must have a different SKU.';
                continue;
            }
            $seen_variant_skus[$sku_key] = true;

            $stmt = $pdo->prepare("SELECT id FROM product_variants WHERE sku = ? AND id != ?");
            $stmt->execute([$vsku, $vid]);
            if ($stmt->fetch()) {
                $errors[] = 'Variant SKU "' . h($vsku) . '" is already in use.';
            }
        }
    }

    // Keep the submitted values on the form if validation/save fails.
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $product['name'] = $name;
        $product['sku'] = $sku;
        $product['brand'] = $brand;
        $product['category_id'] = $category_id;
        $product['description'] = $description;
        $product['materials'] = $materials;
        $product['dimensions'] = $dimensions;
        $product['weight'] = $weight;
        $product['price'] = $price;
        $product['compare_at_price'] = $compare_at_price;
        $product['cost_price'] = $cost_price;
        $product['stock'] = $stock;
        $product['low_stock_threshold'] = $low_stock_threshold;
        $product['allow_backorder'] = $allow_backorder;
        $product['status'] = $status;
        $product['is_featured'] = $is_featured;
        $product['is_bestseller'] = $is_bestseller;
        $product['seo_title'] = $_POST['seo_title'] ?? '';
        $product['seo_description'] = $_POST['seo_description'] ?? '';
    }

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            if ($is_edit) {
            $stmt = $pdo->prepare("
                UPDATE products SET name=?, slug=?, sku=?, brand=?, category_id=?, description=?, materials=?, dimensions=?, weight=?,
                    price=?, compare_at_price=?, cost_price=?, low_stock_threshold=?, allow_backorder=?, status=?, is_featured=?, is_bestseller=?,
                    seo_title=?, seo_description=?
                WHERE id=?
            ");
            $stmt->execute([$name, $slug, $sku, $brand, $category_id, $description, $materials, $dimensions, $weight,
                $price, $compare_at_price, $cost_price, $low_stock_threshold, $allow_backorder, $status, $is_featured, $is_bestseller,
                $_POST['seo_title'] ?? '', $_POST['seo_description'] ?? '', $product_id]);

            // Manual stock correction here is intentionally NOT included —
            // stock changes go through inventory.php so every change is logged.

        } else {
            $stmt = $pdo->prepare("
                INSERT INTO products (name, slug, sku, brand, category_id, description, materials, dimensions, weight,
                    price, compare_at_price, cost_price, stock, low_stock_threshold, allow_backorder, status, is_featured, is_bestseller,
                    seo_title, seo_description)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ");
            $stmt->execute([$name, $slug, $sku, $brand, $category_id, $description, $materials, $dimensions, $weight,
                $price, $compare_at_price, $cost_price, $stock, $low_stock_threshold, $allow_backorder, $status, $is_featured, $is_bestseller,
                $_POST['seo_title'] ?? '', $_POST['seo_description'] ?? '']);
            $product_id = $pdo->lastInsertId();

            if ($stock > 0) {
                $pdo->prepare("INSERT INTO inventory_logs (product_id, previous_qty, change_qty, new_qty, reason, admin_id) VALUES (?,0,?,?,'INITIAL_STOCK',?)")
                    ->execute([$product_id, $stock, $stock, $current_admin['id']]);
            }
        }

        // ---- Image uploads ----
        if (!empty($_FILES['images']['name'][0])) {
            $upload_dir = __DIR__ . '/../assets/images/products/';
            $stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 FROM product_images WHERE product_id = ?");
            $stmt->execute([$product_id]);
            $next_sort = (int)$stmt->fetchColumn();

            foreach ($_FILES['images']['name'] as $i => $filename) {
                if ($_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) continue;
                $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) continue;
                $new_filename = $slug . '-' . uniqid() . '.' . $ext;
                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $upload_dir . $new_filename)) {
                    $stmt = $pdo->prepare("INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$product_id, 'assets/images/products/' . $new_filename, $name, $next_sort++]);
                }
            }
        }

        // ---- Variants (simple repeated rows: variant_name[], variant_sku[], variant_stock[]) ----
        if (!empty($_POST['variant_name'])) {
            foreach ($_POST['variant_name'] as $i => $vname) {
                $vname = trim($vname);
                if ($vname === '') continue;
                $vsku = trim($_POST['variant_sku'][$i] ?? '');
                $vstock = (int)($_POST['variant_stock'][$i] ?? 0);
                $vid = (int)($_POST['variant_id'][$i] ?? 0);

                if ($vid) {
                    $pdo->prepare("UPDATE product_variants SET name=?, sku=?, stock=? WHERE id=? AND product_id=?")
                        ->execute([$vname, $vsku, $vstock, $vid, $product_id]);
                } elseif ($vsku !== '') {
                    $pdo->prepare("INSERT INTO product_variants (product_id, name, sku, stock) VALUES (?,?,?,?)")
                        ->execute([$product_id, $vname, $vsku, $vstock]);
                }
            }
        }

            if ($pdo->inTransaction()) {
                $pdo->commit();
            }

            header('Location: products.php?saved=1');
            exit;
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            // Show a friendly message instead of a blank HTTP 500 page.
            if ($e->getCode() === '23000') {
                $message = strtolower($e->getMessage());
                if (strpos($message, 'product_variants') !== false || strpos($message, 'sku') !== false) {
                    $errors[] = 'This SKU is already in use. Please enter a unique SKU.';
                } elseif (strpos($message, 'slug') !== false) {
                    $errors[] = 'A product with this name already exists. Please choose a different product name.';
                } else {
                    $errors[] = 'Some product information conflicts with existing data. Please check the SKU, name, and variants.';
                }
            } else {
                $errors[] = 'The product could not be saved. Please check the information and try again.';
            }
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $errors[] = 'The product could not be saved. Please try again.';
        }
    }
}

// Keep submitted variant rows visible when validation/save fails.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($errors) && isset($_POST['variant_name'])) {
    $variants = [];
    foreach ($_POST['variant_name'] as $i => $vname) {
        $variants[] = [
            'id' => (int)($_POST['variant_id'][$i] ?? 0),
            'name' => trim($vname),
            'sku' => trim($_POST['variant_sku'][$i] ?? ''),
            'stock' => (int)($_POST['variant_stock'][$i] ?? 0),
        ];
    }
}

$page_title = $is_edit ? 'Edit Product' : 'Add Product';
$active_nav = 'products';
require_once 'includes/admin-header.php';
?>

<?php if (!empty($errors)): ?>
    <div class="alert alert-error"><?php foreach ($errors as $e) echo h($e) . '<br>'; ?></div>
<?php endif; ?>

<form method="POST" action="product-form.php<?php echo $is_edit ? '?id=' . $product_id : ''; ?>" enctype="multipart/form-data">
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem;" class="form-layout">
        <div>
            <div class="panel">
                <h2>Basic Information</h2>
                <div class="form-row"><label>Product Name</label><input type="text" name="name" value="<?php echo h($product['name']); ?>" required></div>
                <div class="form-grid-2">
                    <div class="form-row"><label>SKU</label><input type="text" name="sku" value="<?php echo h($product['sku']); ?>" required></div>
                    <div class="form-row"><label>Brand</label><input type="text" name="brand" value="<?php echo h($product['brand']); ?>"></div>
                </div>
                <div class="form-row">
                    <label>Category</label>
                    <select name="category_id" required>
                        <option value="">Select category</option>
                        <optgroup label="Watches">
                            <?php foreach ($categories as $c): if ($c['section'] !== 'watches') continue; ?>
                                <option value="<?php echo $c['id']; ?>" <?php echo $product['category_id'] == $c['id'] ? 'selected' : ''; ?>><?php echo h($c['name']); ?></option>
                            <?php endforeach; ?>
                        </optgroup>
                        <optgroup label="Accessories">
                            <?php foreach ($categories as $c): if ($c['section'] !== 'accessories') continue; ?>
                                <option value="<?php echo $c['id']; ?>" <?php echo $product['category_id'] == $c['id'] ? 'selected' : ''; ?>><?php echo h($c['name']); ?></option>
                            <?php endforeach; ?>
                        </optgroup>
                    </select>
                </div>
                <div class="form-row"><label>Description</label><textarea name="description" rows="5" required><?php echo h($product['description']); ?></textarea></div>
                <div class="form-grid-2">
                    <div class="form-row"><label>Materials</label><input type="text" name="materials" value="<?php echo h($product['materials']); ?>"></div>
                    <div class="form-row"><label>Dimensions</label><input type="text" name="dimensions" value="<?php echo h($product['dimensions']); ?>"></div>
                </div>
                <div class="form-row"><label>Weight</label><input type="text" name="weight" value="<?php echo h($product['weight']); ?>"></div>
            </div>

            <div class="panel">
                <h2>Pricing</h2>
                <div class="form-grid-2">
                    <div class="form-row"><label>Selling Price (Rs)</label><input type="number" step="0.01" name="price" value="<?php echo h($product['price']); ?>" required></div>
                    <div class="form-row"><label>Compare-at Price (Rs)</label><input type="number" step="0.01" name="compare_at_price" value="<?php echo h($product['compare_at_price']); ?>"></div>
                </div>
                <div class="form-row"><label>Cost Price (Rs) — for your own margin tracking, not shown to customers</label><input type="number" step="0.01" name="cost_price" value="<?php echo h($product['cost_price']); ?>"></div>
            </div>

            <div class="panel">
                <h2>Images</h2>
                <?php if (count($images) > 0): ?>
                <div id="existingImagePreview" style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1rem;">
                    <?php foreach ($images as $img): ?>
                        <div class="product-image-preview" data-image-id="<?php echo (int)$img['id']; ?>">
                            <img src="../<?php echo h($img['url']); ?>" alt="Product image">
                            <button type="button" class="image-remove-btn" onclick="deleteProductImage(this, <?php echo (int)$img['id']; ?>)" aria-label="Remove image">&times;</button>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div id="newImagePreview" style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1rem;"></div>
                <?php endif; ?>
                <div class="form-row">
                    <label>Upload Images (you can select multiple)</label>
                    <input type="file" name="images[]" id="productImages" multiple accept="image/jpeg,image/png,image/webp">
                    <p class="text-soft" style="font-size:0.75rem; margin-top:0.35rem;">Click × on any image to remove it.</p>
                </div>
            </div>

            <div class="panel">
                <h2>Variants <span class="text-soft" style="font-weight:400;">(optional — e.g. Color)</span></h2>
                <div id="variantRows">
                    <?php
                    $variant_rows = count($variants) > 0 ? $variants : [['id' => '', 'name' => '', 'sku' => '', 'stock' => '']];
                    foreach ($variant_rows as $v):
                    ?>
                    <div class="variant-row form-grid-2" style="grid-template-columns: 1fr 1fr 100px auto; align-items:end; gap:0.75rem; margin-bottom:0.75rem;">
                        <input type="hidden" name="variant_id[]" value="<?php echo h($v['id']); ?>">
                        <div class="form-row" style="margin-bottom:0;"><label>Variant Name</label><input type="text" name="variant_name[]" value="<?php echo h($v['name']); ?>" placeholder="e.g. Black"></div>
                        <div class="form-row" style="margin-bottom:0;"><label>Variant SKU</label><input type="text" name="variant_sku[]" value="<?php echo h($v['sku']); ?>" placeholder="e.g. WT-001-BLK"></div>
                        <div class="form-row" style="margin-bottom:0;"><label>Stock</label><input type="number" name="variant_stock[]" value="<?php echo h($v['stock']); ?>"></div>
                        <?php if (!empty($v['id'])): ?>
                            <button type="button" class="btn btn-outline btn-sm" style="color:var(--a-danger); border-color:var(--a-danger);" onclick="deleteVariant(this, <?php echo (int)$v['id']; ?>)">Delete</button>
                        <?php else: ?>
                            <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('.variant-row').remove()">Remove</button>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="addVariantRow()">+ Add Another Variant</button>
            </div>
        </div>

        <div>
            <div class="panel">
                <h2>Inventory</h2>
                <?php if (!$is_edit): ?>
                <div class="form-row"><label>Starting Stock Quantity</label><input type="number" name="stock" value="<?php echo h($product['stock']); ?>"></div>
                <?php else: ?>
                <p class="text-soft" style="font-size:0.8rem; margin-bottom:0.75rem;">Current stock: <strong><?php echo (int)$product['stock']; ?></strong>. To change it, use the <a href="inventory.php">Inventory</a> page so it's logged.</p>
                <?php endif; ?>
                <div class="form-row"><label>Low Stock Threshold</label><input type="number" name="low_stock_threshold" value="<?php echo h($product['low_stock_threshold']); ?>"></div>
                <div class="form-row" style="display:flex; align-items:center; gap:0.5rem;">
                    <input type="checkbox" name="allow_backorder" id="backorder" style="width:auto;" <?php echo $product['allow_backorder'] ? 'checked' : ''; ?>>
                    <label for="backorder" style="margin:0;">Allow orders when out of stock</label>
                </div>
            </div>

            <div class="panel">
                <h2>Status</h2>
                <div class="form-row">
                    <label>Visibility</label>
                    <select name="status">
                        <option value="ACTIVE" <?php echo $product['status'] === 'ACTIVE' ? 'selected' : ''; ?>>Active (visible on store)</option>
                        <option value="DRAFT" <?php echo $product['status'] === 'DRAFT' ? 'selected' : ''; ?>>Draft (hidden)</option>
                    </select>
                </div>
                <div class="form-row" style="display:flex; align-items:center; gap:0.5rem;">
                    <input type="checkbox" name="is_featured" id="featured" style="width:auto;" <?php echo $product['is_featured'] ? 'checked' : ''; ?>>
                    <label for="featured" style="margin:0;">Featured on homepage</label>
                </div>
                <div class="form-row" style="display:flex; align-items:center; gap:0.5rem;">
                    <input type="checkbox" name="is_bestseller" id="bestseller" style="width:auto;" <?php echo $product['is_bestseller'] ? 'checked' : ''; ?>>
                    <label for="bestseller" style="margin:0;">Mark as Best Seller</label>
                </div>
                <p class="text-soft" style="font-size:0.78rem; margin-top:-0.25rem;">
                    Best Sellers shows manually-marked products first, then fills remaining spots using real sales data once you have orders.
                </p>
            </div>

            <div class="panel">
                <h2>SEO</h2>
                <div class="form-row"><label>SEO Title</label><input type="text" name="seo_title" value="<?php echo h($product['seo_title']); ?>"></div>
                <div class="form-row"><label>Meta Description</label><textarea name="seo_description" rows="3"><?php echo h($product['seo_description']); ?></textarea></div>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%;">Save & Publish</button>
            <a href="products.php" class="btn btn-outline" style="width:100%; text-align:center; margin-top:0.5rem;">Cancel</a>
        </div>
    </div>
</form>

<style>
@media (max-width: 900px) { .form-layout { grid-template-columns: 1fr !important; } }
</style>

<style>
.product-image-preview {
    position:relative;
    width:80px;
    height:80px;
}
.product-image-preview img {
    width:80px;
    height:80px;
    object-fit:cover;
    border-radius:6px;
    border:1px solid var(--a-border);
    display:block;
}
.image-remove-btn {
    position:absolute;
    top:-7px;
    right:-7px;
    width:22px;
    height:22px;
    border:0;
    border-radius:50%;
    background:var(--a-danger);
    color:#fff;
    font-size:16px;
    line-height:22px;
    padding:0;
    cursor:pointer;
    box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.image-remove-btn:hover { opacity:.85; }
</style>
<script>

var productImageInput = document.getElementById('productImages');
var newImagePreview = document.getElementById('newImagePreview');

if (productImageInput) {
    productImageInput.addEventListener('change', function () {
        newImagePreview.innerHTML = '';

        Array.from(this.files).forEach(function (file, index) {
            if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;

            var reader = new FileReader();
            reader.onload = function (event) {
                var wrapper = document.createElement('div');
                wrapper.className = 'product-image-preview';
                wrapper.innerHTML = '<img src="' + event.target.result + '" alt="New product image">' +
                    '<button type="button" class="image-remove-btn" aria-label="Remove image">&times;</button>';

                wrapper.querySelector('button').addEventListener('click', function () {
                    removeNewImage(index);
                });

                newImagePreview.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    });
}

function removeNewImage(index) {
    if (!productImageInput) return;

    var files = Array.from(productImageInput.files);
    files.splice(index, 1);

    var dataTransfer = new DataTransfer();
    files.forEach(function (file) { dataTransfer.items.add(file); });
    productImageInput.files = dataTransfer.files;
    productImageInput.dispatchEvent(new Event('change'));
}

function deleteProductImage(button, imageId) {
    if (!confirm('Remove this product image? This cannot be undone.')) return;

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = 'image-delete.php';

    var image = document.createElement('input');
    image.type = 'hidden';
    image.name = 'image_id';
    image.value = imageId;
    form.appendChild(image);

    var product = document.createElement('input');
    product.type = 'hidden';
    product.name = 'product_id';
    product.value = <?php echo (int)$product_id; ?>;
    form.appendChild(product);

    document.body.appendChild(form);
    form.submit();
}

function addVariantRow() {
    var container = document.getElementById('variantRows');
    var row = document.createElement('div');
    row.className = 'variant-row form-grid-2';
    row.style.cssText = 'grid-template-columns: 1fr 1fr 100px auto; align-items:end; gap:0.75rem; margin-bottom:0.75rem;';
    row.innerHTML = '<input type="hidden" name="variant_id[]" value="">' +
        '<div class="form-row" style="margin-bottom:0;"><label>Variant Name</label><input type="text" name="variant_name[]" placeholder="e.g. Silver"></div>' +
        '<div class="form-row" style="margin-bottom:0;"><label>Variant SKU</label><input type="text" name="variant_sku[]" placeholder="e.g. WT-001-SLV"></div>' +
        '<div class="form-row" style="margin-bottom:0;"><label>Stock</label><input type="number" name="variant_stock[]" value="0"></div>' +
        '<button type="button" class="btn btn-outline btn-sm" onclick="this.closest(\'.variant-row\').remove()">Remove</button>';
    container.appendChild(row);
}

function deleteVariant(button, variantId) {
    if (!confirm('Delete this variant? It will no longer be available for sale.')) return;

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = 'variant-delete.php';

    var id = document.createElement('input');
    id.type = 'hidden';
    id.name = 'variant_id';
    id.value = variantId;
    form.appendChild(id);

    var product = document.createElement('input');
    product.type = 'hidden';
    product.name = 'product_id';
    product.value = <?php echo (int)$product_id; ?>;
    form.appendChild(product);

    document.body.appendChild(form);
    form.submit();
}
</script>

<?php require_once 'includes/admin-footer.php'; ?>
