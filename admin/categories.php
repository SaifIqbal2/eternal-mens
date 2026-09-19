<?php
require_once 'includes/auth.php';

// Handles an uploaded category image: validates it, moves it into
// assets/images/categories/, and returns the relative path to store
// in the database — or null if no valid file was uploaded.
function handle_category_image_upload($slug) {
    if (empty($_FILES['image']['name']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
        return null;
    }
    $upload_dir = __DIR__ . '/../assets/images/categories/';
    $new_filename = $slug . '-' . uniqid() . '.' . $ext;
    if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_dir . $new_filename)) {
        return 'assets/images/categories/' . $new_filename;
    }
    return null;
}

// ---- Add ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_category'])) {
    $name = trim($_POST['name']);
    $section = in_array($_POST['section'] ?? '', ['watches', 'accessories']) ? $_POST['section'] : 'accessories';
    if ($name !== '') {
        $slug = slugify($name);
        $image_path = handle_category_image_upload($slug);
        $stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 FROM categories");
        $stmt->execute();
        $next_sort = $stmt->fetchColumn();
        $pdo->prepare("INSERT INTO categories (name, slug, section, description, image, is_active, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)")
            ->execute([$name, $slug, $section, trim($_POST['description'] ?? ''), $image_path, $next_sort]);
    }
    header('Location: categories.php?saved=1');
    exit;
}

// ---- Update (name / section / description / image — slug stays the
//      same on purpose, so any existing links to this category never
//      break) ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_category'])) {
    $id = (int)$_POST['category_id'];
    $name = trim($_POST['name']);
    $section = in_array($_POST['section'] ?? '', ['watches', 'accessories']) ? $_POST['section'] : 'accessories';
    if ($name !== '' && $id > 0) {
        $stmt = $pdo->prepare("SELECT slug, image FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        $current = $stmt->fetch();

        $new_image_path = handle_category_image_upload($current['slug'] ?? slugify($name));

        if ($new_image_path) {
            // Replacing an image — delete the old uploaded file so they
            // don't quietly pile up on disk every time it's changed.
            if (!empty($current['image']) && file_exists(__DIR__ . '/../' . $current['image'])) {
                @unlink(__DIR__ . '/../' . $current['image']);
            }
            $pdo->prepare("UPDATE categories SET name = ?, section = ?, description = ?, image = ? WHERE id = ?")
                ->execute([$name, $section, trim($_POST['description'] ?? ''), $new_image_path, $id]);
        } else {
            // No new file chosen — keep whatever image (or lack of one) it already had.
            $pdo->prepare("UPDATE categories SET name = ?, section = ?, description = ? WHERE id = ?")
                ->execute([$name, $section, trim($_POST['description'] ?? ''), $id]);
        }
    }
    header('Location: categories.php?saved=1');
    exit;
}

// ---- Show/hide toggle ----
if (isset($_GET['toggle'])) {
    $pdo->prepare("UPDATE categories SET is_active = NOT is_active WHERE id = ?")->execute([(int)$_GET['toggle']]);
    header('Location: categories.php');
    exit;
}

// ---- Delete (blocked if products still use it) ----
if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_id = ?");
    $stmt->execute([$id]);
    $product_count = $stmt->fetchColumn();

    if ($product_count > 0) {
        header('Location: categories.php?delete_blocked=' . $product_count);
        exit;
    }
    $stmt = $pdo->prepare("SELECT image FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $image_to_remove = $stmt->fetchColumn();
    if ($image_to_remove && file_exists(__DIR__ . '/../' . $image_to_remove)) {
        @unlink(__DIR__ . '/../' . $image_to_remove);
    }
    $pdo->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
    header('Location: categories.php?deleted=1');
    exit;
}

// ---- If editing, load that category's current values to prefill the form ----
$editing = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([(int)$_GET['edit']]);
    $editing = $stmt->fetch();
}

$categories = $pdo->query("
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.section, c.sort_order
")->fetchAll();

$page_title = 'Categories';
$active_nav = 'categories';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['saved'])): ?><div class="alert alert-success">Category saved.</div><?php endif; ?>
<?php if (isset($_GET['deleted'])): ?><div class="alert alert-success">Category deleted.</div><?php endif; ?>
<?php if (isset($_GET['delete_blocked'])): ?>
    <div class="alert alert-error">
        Can't delete — <?php echo (int)$_GET['delete_blocked']; ?> product(s) are still using this category.
        Move them to a different category first (Products → edit each one → change Category), then try deleting again.
    </div>
<?php endif; ?>

<div class="panel">
    <h2><?php echo $editing ? 'Edit Category' : 'Add New Category'; ?></h2>
    <p class="text-soft" style="font-size:0.8rem; margin-bottom:1rem;">
        Choose "Watches" for a watch type (e.g. Chronograph, Diver) or "Accessories" for a
        product line like Wallets or Belts — this controls which page's filter dropdown it shows up in.
        <?php if ($editing): ?><br>Note: renaming a category does not change its web address (URL), so any existing links to it keep working.<?php endif; ?>
    </p>
    <form method="POST" action="categories.php" enctype="multipart/form-data">
        <?php if ($editing): ?>
            <input type="hidden" name="category_id" value="<?php echo (int)$editing['id']; ?>">
        <?php endif; ?>
        <div class="form-grid-2">
            <div class="form-row">
                <label>Category Name</label>
                <input type="text" name="name" placeholder="e.g. Wallets, or Smart Watch" value="<?php echo h($editing['name'] ?? ''); ?>" required>
            </div>
            <div class="form-row">
                <label>Section</label>
                <select name="section">
                    <option value="accessories" <?php echo (!$editing || $editing['section'] === 'accessories') ? 'selected' : ''; ?>>Accessories</option>
                    <option value="watches" <?php echo ($editing && $editing['section'] === 'watches') ? 'selected' : ''; ?>>Watches</option>
                </select>
            </div>
        </div>

        <div class="form-row">
            <label>Category Image</label>
            <?php if ($editing && !empty($editing['image'])): ?>
                <div style="margin-bottom:0.6rem; display:flex; align-items:center; gap:0.75rem;">
                    <img src="../<?php echo h($editing['image']); ?>" alt="" style="width:48px; height:48px; object-fit:cover; border-radius:50%; border:1px solid var(--a-border);">
                    <span class="text-soft">Current image — choose a file below to replace it</span>
                </div>
            <?php endif; ?>
            <input type="file" name="image" accept=".jpg,.jpeg,.png,.webp">
            <p class="text-soft" style="font-size:0.78rem; margin-top:0.4rem;">Shows as the circular image in "Shop by Category" on the homepage. Square photos work best.</p>
        </div>

        <?php if ($editing): ?>
            <button type="submit" name="update_category" value="1" class="btn btn-primary">Save Changes</button>
            <a href="categories.php" class="btn btn-outline">Cancel</a>
        <?php else: ?>
            <button type="submit" name="add_category" value="1" class="btn btn-primary">Add Category</button>
        <?php endif; ?>
    </form>
</div>

<div class="panel">
    <h2>All Categories</h2>
    <div class="table-wrap">
    <table>
        <tr><th></th><th>Name</th><th>Section</th><th>Products</th><th>Status</th><th colspan="3"></th></tr>
        <?php foreach ($categories as $c): ?>
        <tr>
            <td>
                <?php if (!empty($c['image'])): ?>
                    <img src="../<?php echo h($c['image']); ?>" alt="" class="thumb-sm" style="border-radius:50%;">
                <?php else: ?>
                    <span class="thumb-sm" style="border-radius:50%; display:inline-block;"></span>
                <?php endif; ?>
            </td>
            <td><?php echo h($c['name']); ?></td>
            <td><span class="badge-status badge-<?php echo $c['section'] === 'watches' ? 'CONFIRMED' : 'ACTIVE'; ?>"><?php echo $c['section'] === 'watches' ? 'Watches' : 'Accessories'; ?></span></td>
            <td><?php echo (int)$c['product_count']; ?></td>
            <td><span class="badge-status badge-<?php echo $c['is_active'] ? 'ACTIVE' : 'DRAFT'; ?>"><?php echo $c['is_active'] ? 'Visible' : 'Hidden'; ?></span></td>
            <td><a href="categories.php?toggle=<?php echo $c['id']; ?>" class="btn btn-outline btn-sm"><?php echo $c['is_active'] ? 'Hide' : 'Show'; ?></a></td>
            <td><a href="categories.php?edit=<?php echo $c['id']; ?>" class="btn btn-outline btn-sm">Edit</a></td>
            <td>
                <?php if ($c['product_count'] > 0): ?>
                    <button type="button" class="btn btn-outline btn-sm" disabled title="Move its <?php echo (int)$c['product_count']; ?> product(s) to another category first">Delete</button>
                <?php else: ?>
                    <a href="categories.php?delete=<?php echo $c['id']; ?>" class="btn btn-danger btn-sm" onclick="return confirm('Delete this category? This cannot be undone.');">Delete</a>
                <?php endif; ?>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
</div>

<?php require_once 'includes/admin-footer.php'; ?>