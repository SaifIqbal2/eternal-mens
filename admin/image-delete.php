<?php
require_once 'includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: products.php');
    exit;
}

$image_id = (int)($_POST['image_id'] ?? 0);
$product_id = (int)($_POST['product_id'] ?? 0);

if (!$image_id || !$product_id) {
    header('Location: products.php');
    exit;
}

$stmt = $pdo->prepare("SELECT id, url FROM product_images WHERE id = ? AND product_id = ?");
$stmt->execute([$image_id, $product_id]);
$image = $stmt->fetch();

if (!$image) {
    header('Location: product-form.php?id=' . $product_id);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("DELETE FROM product_images WHERE id = ? AND product_id = ?");
    $stmt->execute([$image_id, $product_id]);

    $file_path = __DIR__ . '/../' . ltrim($image['url'], '/');
    if (is_file($file_path)) {
        @unlink($file_path);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
}

header('Location: product-form.php?id=' . $product_id . '&image_deleted=1');
exit;
