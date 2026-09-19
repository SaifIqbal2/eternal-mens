<?php
require_once 'includes/auth.php';

$id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$p = $stmt->fetch();

if ($p) {
    $new_name = $p['name'] . ' (Copy)';
    $new_slug = slugify($new_name) . '-' . substr(uniqid(), -5);
    $new_sku = $p['sku'] . '-COPY-' . substr(uniqid(), -5);

    $stmt = $pdo->prepare("
        INSERT INTO products (name, slug, sku, brand, category_id, description, materials, dimensions, weight,
            price, compare_at_price, cost_price, stock, low_stock_threshold, allow_backorder, status, is_featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,?,?)
    ");
    // note: duplicated product starts at 0 stock — owner sets it via Inventory so it's logged
    $stmt->execute([
        $new_name, $new_slug, $new_sku, $p['brand'], $p['category_id'], $p['description'],
        $p['materials'], $p['dimensions'], $p['weight'], $p['price'], $p['compare_at_price'],
        $p['cost_price'], $p['low_stock_threshold'], $p['allow_backorder'], 'DRAFT', 0,
    ]);
    $new_id = $pdo->lastInsertId();

    // Copy images too
    $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order");
    $stmt->execute([$id]);
    foreach ($stmt->fetchAll() as $img) {
        $pdo->prepare("INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES (?,?,?,?)")
            ->execute([$new_id, $img['url'], $img['alt_text'], $img['sort_order']]);
    }
}

header('Location: products.php?saved=1');
exit;
