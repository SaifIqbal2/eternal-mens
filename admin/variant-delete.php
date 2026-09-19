<?php
require_once 'includes/auth.php';

$product_id = (int)($_POST['product_id'] ?? 0);
$variant_id = (int)($_POST['variant_id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !$product_id || !$variant_id) {
    header('Location: products.php');
    exit;
}

$stmt = $pdo->prepare("SELECT id, product_id, stock FROM product_variants WHERE id = ? AND product_id = ? AND is_active = 1");
$stmt->execute([$variant_id, $product_id]);
$variant = $stmt->fetch();

if (!$variant) {
    header('Location: product-form.php?id=' . $product_id);
    exit;
}

try {
    $pdo->beginTransaction();

    // Soft-delete the variant so old orders and inventory history remain valid.
    $pdo->prepare("UPDATE product_variants SET is_active = 0 WHERE id = ? AND product_id = ?")
        ->execute([$variant_id, $product_id]);

    // Removing a stocked variant also removes that quantity from sellable product stock.
    if ((int)$variant['stock'] > 0) {
        $pdo->prepare("\n            INSERT INTO inventory_logs\n                (product_id, variant_id, previous_qty, change_qty, new_qty, reason, admin_id)\n            VALUES (?, ?, ?, ?, 0, 'MANUAL_ADJUSTMENT', ?)\n        ")->execute([
            $product_id,
            $variant_id,
            (int)$variant['stock'],
            -(int)$variant['stock'],
            $current_admin['id']
        ]);
    }

    sync_product_stock($pdo, $product_id);
    $pdo->commit();
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
}

header('Location: product-form.php?id=' . $product_id . '&variant_deleted=1');
exit;
