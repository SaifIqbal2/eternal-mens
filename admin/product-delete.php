<?php
require_once 'includes/auth.php';

$id = (int)($_GET['id'] ?? 0);
if ($id) {
    // Images/variants/inventory logs cascade-delete automatically (foreign keys),
    // but a product that's been ordered can't be deleted (keeps order history intact).
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM order_items WHERE product_id = ?");
    $stmt->execute([$id]);
    if ($stmt->fetchColumn() > 0) {
        header('Location: products.php?error=has_orders');
        exit;
    }
    $pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$id]);
}
header('Location: products.php?deleted=1');
exit;
