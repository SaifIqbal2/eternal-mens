<?php
require_once 'includes/auth.php';

// ---- Handle stock update ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_stock'])) {
    $product_id = (int)$_POST['product_id'];
    $variant_id = !empty($_POST['variant_id']) ? (int)$_POST['variant_id'] : null;
    $new_stock = max(0, (int)$_POST['new_stock']);

    if ($variant_id) {
        $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ? AND product_id = ?");
        $stmt->execute([$variant_id, $product_id]);
        $prev = $stmt->fetchColumn();

        if ($prev !== false && $new_stock != $prev) {
            $pdo->prepare("UPDATE product_variants SET stock = ? WHERE id = ? AND product_id = ?")
                ->execute([$new_stock, $variant_id, $product_id]);

            $pdo->prepare("
                INSERT INTO inventory_logs (product_id, variant_id, previous_qty, change_qty, new_qty, reason, admin_id)
                VALUES (?, ?, ?, ?, ?, 'MANUAL_ADJUSTMENT', ?)
            ")->execute([$product_id, $variant_id, $prev, $new_stock - $prev, $new_stock, $current_admin['id']]);

            sync_product_stock($pdo, $product_id);
        }
    } else {
        // Only products without variants use products.stock directly.
        $stmt = $pdo->prepare("SELECT p.stock FROM products p WHERE p.id = ? AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1)");
        $stmt->execute([$product_id]);
        $prev = $stmt->fetchColumn();

        if ($prev !== false && $new_stock != $prev) {
            $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?")->execute([$new_stock, $product_id]);
            $pdo->prepare("
                INSERT INTO inventory_logs (product_id, previous_qty, change_qty, new_qty, reason, admin_id)
                VALUES (?, ?, ?, ?, 'MANUAL_ADJUSTMENT', ?)
            ")->execute([$product_id, $prev, $new_stock - $prev, $new_stock, $current_admin['id']]);
        }
    }

    header('Location: inventory.php?updated=1');
    exit;
}

$search = trim($_GET['q'] ?? '');
$where = "1=1";
$params = [];
if ($search !== '') {
    $where = "(p.name LIKE ? OR p.sku LIKE ? OR pv.name LIKE ? OR pv.sku LIKE ?)";
    $params = ["%$search%", "%$search%", "%$search%", "%$search%"];
}

$stmt = $pdo->prepare("
    SELECT p.*, pv.id AS variant_id, pv.name AS variant_name, pv.sku AS variant_sku, pv.stock AS variant_stock
    FROM products p
    LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = 1
    WHERE $where
    ORDER BY p.stock ASC, p.name ASC, pv.id ASC
");
$stmt->execute($params);
$products = $stmt->fetchAll();

// Recent history across all products
$history = $pdo->query("
    SELECT il.*, p.name AS product_name, p.sku, a.name AS admin_name, o.order_number,
           pv.name AS variant_name, pv.sku AS variant_sku
    FROM inventory_logs il
    JOIN products p ON p.id = il.product_id
    LEFT JOIN product_variants pv ON pv.id = il.variant_id
    LEFT JOIN admins a ON a.id = il.admin_id
    LEFT JOIN orders o ON o.id = il.order_id
    ORDER BY il.created_at DESC
    LIMIT 25
")->fetchAll();

$page_title = 'Inventory';
$active_nav = 'inventory';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['updated'])): ?><div class="alert alert-success">Stock updated.</div><?php endif; ?>

<div class="panel">
    <form method="GET" action="inventory.php" style="display:flex; gap:0.75rem;">
        <input type="text" name="q" value="<?php echo h($search); ?>" placeholder="Search product, SKU or variant" style="flex:1; padding:0.55rem 0.7rem; border:1px solid var(--a-border); border-radius:6px;">
        <button type="submit" class="btn btn-outline">Search</button>
    </form>
</div>

<div class="panel">
    <h2>Stock Levels</h2>
    <div class="table-wrap">
    <table>
        <tr><th>Product</th><th>SKU</th><th>Variant</th><th>Current Stock</th><th>Low Stock At</th><th>Update Stock</th></tr>
        <?php foreach ($products as $p): ?>
        <?php
            $has_variant = $p['variant_id'] !== null;
            $current_stock = $has_variant ? (int)$p['variant_stock'] : (int)$p['stock'];
            $cls = $current_stock == 0 ? 'OUT_OF_STOCK' : ($current_stock <= $p['low_stock_threshold'] ? 'LOW_STOCK' : 'IN_STOCK');
        ?>
        <tr>
            <td><?php echo h($p['name']); ?></td>
            <td class="mono"><?php echo h($has_variant ? $p['variant_sku'] : $p['sku']); ?></td>
            <td><?php echo $has_variant ? h($p['variant_name']) : '<span class="text-soft">—</span>'; ?></td>
            <td><span class="badge-status badge-<?php echo $cls; ?>"><?php echo $current_stock; ?></span></td>
            <td class="text-soft"><?php echo (int)$p['low_stock_threshold']; ?></td>
            <td>
                <form method="POST" action="inventory.php" class="qty-stepper">
                    <input type="hidden" name="product_id" value="<?php echo (int)$p['id']; ?>">
                    <?php if ($has_variant): ?><input type="hidden" name="variant_id" value="<?php echo (int)$p['variant_id']; ?>"><?php endif; ?>
                    <button type="button" onclick="step(this, -1)">−</button>
                    <input type="number" min="0" name="new_stock" value="<?php echo $current_stock; ?>">
                    <button type="button" onclick="step(this, 1)">+</button>
                    <button type="submit" name="update_stock" value="1" class="btn btn-outline btn-sm">Update</button>
                </form>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
</div>

<div class="panel">
    <h2>Recent Inventory History</h2>
    <!-- <div 
            style="display:flex; gap:0.5rem;">
            <a href="inventory-export.php" class="btn btn-outline">Export CSV</a>
        </div> -->
    <?php if (count($history) === 0): ?>
        <div class="empty">No inventory changes yet.</div>
    <?php else: ?>
    <div class="table-wrap">
    <table>
        <tr><th>Date</th><th>Product</th><th>SKU</th><th>Variant</th><th>Change</th><th>Previous → New</th><th>Reason</th><th>By</th></tr>
        <?php foreach ($history as $h): ?>
        <tr>
            <td class="text-soft"><?php echo date('d M, g:ia', strtotime($h['created_at'])); ?></td>
            <td><?php echo h($h['product_name']); ?></td>
            <td class="mono"><?php echo h($h['variant_sku'] ?: $h['sku']); ?></td>
            <td><?php echo $h['variant_name'] ? h($h['variant_name']) : '<span class="text-soft">—</span>'; ?></td>
            <td class="mono" style="color: <?php echo $h['change_qty'] >= 0 ? 'var(--a-success)' : 'var(--a-danger)'; ?>;">
                <?php echo $h['change_qty'] >= 0 ? '+' : ''; ?><?php echo $h['change_qty']; ?>
            </td>
            <td class="mono text-soft"><?php echo $h['previous_qty']; ?> → <?php echo $h['new_qty']; ?></td>
            <td class="text-soft">
                <?php echo str_replace('_', ' ', $h['reason']); ?>
                <?php echo $h['order_number'] ? ' (' . h($h['order_number']) . ')' : ''; ?>
            </td>
            <td class="text-soft"><?php echo h($h['admin_name'] ?? '—'); ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php endif; ?>
</div>

<script>
function step(btn, delta) {
    var input = btn.parentElement.querySelector('input[name="new_stock"]');
    var val = Math.max(0, parseInt(input.value || 0, 10) + delta);
    input.value = val;
}
</script>

<?php require_once 'includes/admin-footer.php'; ?>
