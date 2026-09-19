<?php
require_once 'includes/auth.php';

$products = $pdo->query("SELECT id, name, sku FROM products WHERE status = 'ACTIVE' ORDER BY name ASC")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_discount'])) {
    $code = strtoupper(trim($_POST['code']));
    $type = $_POST['type'] === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE';
    $value = (float)$_POST['value'];
    $min_order = $_POST['min_order_amount'] !== '' ? (float)$_POST['min_order_amount'] : null;
    $usage_limit = $_POST['usage_limit'] !== '' ? (int)$_POST['usage_limit'] : null;
    $expires_at = $_POST['expires_at'] !== '' ? $_POST['expires_at'] : null;
    $product_ids = array_values(array_unique(array_filter(array_map('intval', $_POST['product_ids'] ?? []))));

    if ($code !== '' && $value > 0) {
        $stmt = $pdo->prepare("
            INSERT INTO discounts (code, type, value, min_order_amount, usage_limit, expires_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([$code, $type, $value, $min_order, $usage_limit, $expires_at]);
        $discount_id = $pdo->lastInsertId();

        // No selected products = discount applies to the whole store.
        if ($product_ids) {
            $stmt = $pdo->prepare("INSERT INTO discount_products (discount_id, product_id) VALUES (?, ?)");
            foreach ($product_ids as $product_id) {
                $stmt->execute([$discount_id, $product_id]);
            }
        }
    }
    header('Location: discounts.php?saved=1');
    exit;
}

if (isset($_GET['toggle'])) {
    $pdo->prepare("UPDATE discounts SET is_active = NOT is_active WHERE id = ?")->execute([(int)$_GET['toggle']]);
    header('Location: discounts.php');
    exit;
}

if (isset($_GET['delete'])) {
    $pdo->prepare("DELETE FROM discounts WHERE id = ?")->execute([(int)$_GET['delete']]);
    header('Location: discounts.php');
    exit;
}

$discounts = $pdo->query("
    SELECT d.*, COUNT(dp.product_id) AS restricted_product_count
    FROM discounts d
    LEFT JOIN discount_products dp ON dp.discount_id = d.id
    GROUP BY d.id
    ORDER BY d.created_at DESC
")->fetchAll();

$page_title = 'Discounts';
$active_nav = 'discounts';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['saved'])): ?><div class="alert alert-success">Discount code created.</div><?php endif; ?>

<div class="panel">
    <h2>Create Discount Code</h2>
    <form method="POST" action="discounts.php">
        <div class="form-grid-2">
            <div class="form-row"><label>Code</label><input type="text" name="code" placeholder="e.g. SUMMER20" required style="text-transform:uppercase;"></div>
            <div class="form-row">
                <label>Type</label>
                <select name="type">
                    <option value="PERCENTAGE">Percentage Off</option>
                    <option value="FIXED_AMOUNT">Fixed Amount Off (Rs)</option>
                </select>
            </div>
        </div>
        <div class="form-grid-2">
            <div class="form-row"><label>Value</label><input type="number" step="0.01" name="value" required></div>
            <div class="form-row"><label>Minimum Order Amount (Rs, optional)</label><input type="number" step="0.01" name="min_order_amount"></div>
        </div>
        <div class="form-grid-2">
            <div class="form-row"><label>Usage Limit (optional)</label><input type="number" name="usage_limit"></div>
            <div class="form-row"><label>Expiry Date (optional)</label><input type="date" name="expires_at"></div>
        </div>

        <div class="form-row">
            <label>Products (optional)</label>
            <p class="text-soft" style="font-size:0.8rem; margin:0 0 0.75rem;">Leave all unchecked to apply this code to the whole store.</p>
            <div style="max-height:220px; overflow:auto; border:1px solid var(--a-border); border-radius:6px; padding:0.75rem;">
                <?php foreach ($products as $product): ?>
                    <label style="display:flex; align-items:center; gap:0.6rem; padding:0.4rem 0; cursor:pointer;">
                        <input type="checkbox" name="product_ids[]" value="<?php echo (int)$product['id']; ?>" style="width:auto;">
                        <span><?php echo h($product['name']); ?> <span class="text-soft mono">(<?php echo h($product['sku']); ?>)</span></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <button type="submit" name="add_discount" value="1" class="btn btn-primary">Create Code</button>
    </form>
</div>

<div class="panel">
    <h2>All Discount Codes</h2>
    <?php if (count($discounts) === 0): ?>
        <div class="empty">No discount codes yet.</div>
    <?php else: ?>
    <div class="table-wrap">
    <table>
        <tr><th>Code</th><th>Type</th><th>Value</th><th>Applies To</th><th>Used</th><th>Expires</th><th>Status</th><th></th></tr>
        <?php foreach ($discounts as $d): ?>
        <tr>
            <td class="mono"><?php echo h($d['code']); ?></td>
            <td><?php echo $d['type'] === 'PERCENTAGE' ? '% Off' : 'Fixed Amount'; ?></td>
            <td><?php echo $d['type'] === 'PERCENTAGE' ? $d['value'] . '%' : format_price($d['value']); ?></td>
            <td><?php echo (int)$d['restricted_product_count'] > 0 ? (int)$d['restricted_product_count'] . ' product' . ((int)$d['restricted_product_count'] === 1 ? '' : 's') : 'All products'; ?></td>
            <td><?php echo (int)$d['times_used']; ?><?php echo $d['usage_limit'] ? ' / ' . (int)$d['usage_limit'] : ''; ?></td>
            <td class="text-soft"><?php echo $d['expires_at'] ? date('d M Y', strtotime($d['expires_at'])) : 'No expiry'; ?></td>
            <td><span class="badge-status badge-<?php echo $d['is_active'] ? 'ACTIVE' : 'DRAFT'; ?>"><?php echo $d['is_active'] ? 'Active' : 'Disabled'; ?></span></td>
            <td style="white-space:nowrap;">
                <a href="discounts.php?toggle=<?php echo $d['id']; ?>" class="btn btn-outline btn-sm"><?php echo $d['is_active'] ? 'Disable' : 'Enable'; ?></a>
                <a href="discounts.php?delete=<?php echo $d['id']; ?>" class="btn btn-danger btn-sm" onclick="return confirm('Delete this code?');">Delete</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/admin-footer.php'; ?>
