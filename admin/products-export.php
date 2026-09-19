<?php
require_once 'includes/auth.php';

$products = $pdo->query("
    SELECT p.name, p.slug, p.sku, p.brand, c.name AS category, p.price, p.compare_at_price,
           p.cost_price, p.stock, p.low_stock_threshold, p.status, p.is_featured,
           p.description, p.materials, p.dimensions, p.weight
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ORDER BY p.name
")->fetchAll();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=eternal-mens-products-' . date('Y-m-d') . '.csv');

$out = fopen('php://output', 'w');
fputcsv($out, ['name', 'slug', 'sku', 'brand', 'category', 'price', 'compare_at_price', 'cost_price', 'stock', 'low_stock_threshold', 'status', 'is_featured', 'description', 'materials', 'dimensions', 'weight']);
foreach ($products as $p) {
    fputcsv($out, $p);
}
fclose($out);
exit;
