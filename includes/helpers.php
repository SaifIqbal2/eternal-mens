<?php
// ============================================================
// SHARED HELPER FUNCTIONS
// ============================================================

function format_price($amount) {
    return 'Rs ' . number_format((float)$amount, 0);
}

// Returns 'IN_STOCK', 'LOW_STOCK', or 'OUT_OF_STOCK'
function stock_state($stock, $low_stock_threshold) {
    if ($stock <= 0) return 'OUT_OF_STOCK';
    if ($stock <= $low_stock_threshold) return 'LOW_STOCK';
    return 'IN_STOCK';
}

function sync_product_stock($pdo, $product_id) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM product_variants WHERE product_id = ? AND is_active = 1");
    $stmt->execute([$product_id]);
    $variant_count = (int)$stmt->fetchColumn();

    if ($variant_count > 0) {
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(stock), 0) FROM product_variants WHERE product_id = ? AND is_active = 1");
        $stmt->execute([$product_id]);
        $stock = (int)$stmt->fetchColumn();
        $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?")->execute([$stock, $product_id]);
        return $stock;
    }

    return null;
}

function stock_label($stock, $low_stock_threshold) {
    $state = stock_state($stock, $low_stock_threshold);
    if ($state === 'OUT_OF_STOCK') return 'Out of Stock';
    if ($state === 'LOW_STOCK') return "Only $stock left";
    return 'In Stock';
}

// Always escape user-facing text output with this to prevent XSS
function h($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

function slugify($text) {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-');
}

function generate_order_number($id) {
    return 'ORD-' . (1000 + (int)$id);
}
