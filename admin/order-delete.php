<?php
require_once 'includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: orders.php');
    exit;
}

$order_id = (int)($_POST['order_id'] ?? 0);
if ($order_id <= 0) {
    header('Location: orders.php');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$order_id]);
$order = $stmt->fetch();

if (!$order) {
    header('Location: orders.php');
    exit;
}

try {
    $pdo->beginTransaction();

    // If this order still has stock deducted, restore it before deleting the order.
    // This keeps inventory correct even when an admin deletes an active order.
    if ($order['stock_deducted'] && !$order['stock_restored']) {
        $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $stmt->execute([$order_id]);
        $items = $stmt->fetchAll();

        foreach ($items as $item) {
            if ($item['variant_id']) {
                $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ?");
                $stmt->execute([$item['variant_id']]);
                $prev = $stmt->fetchColumn();

                if ($prev !== false) {
                    $new = (int)$prev + (int)$item['quantity'];
                    $pdo->prepare("UPDATE product_variants SET stock = ? WHERE id = ?")
                        ->execute([$new, $item['variant_id']]);
                    sync_product_stock($pdo, $item['product_id']);

                    $pdo->prepare("INSERT INTO inventory_logs "
                        . "(product_id, variant_id, previous_qty, change_qty, new_qty, reason, order_id, admin_id) "
                        . "VALUES (?, ?, ?, ?, ?, 'ORDER_DELETED', ?, ?)"
                    )->execute([
                        $item['product_id'], $item['variant_id'], $prev,
                        $item['quantity'], $new, $order_id, $current_admin['id']
                    ]);
                }
            } else {
                $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                $stmt->execute([$item['product_id']]);
                $prev = $stmt->fetchColumn();

                if ($prev !== false) {
                    $new = (int)$prev + (int)$item['quantity'];
                    $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?")
                        ->execute([$new, $item['product_id']]);

                    $pdo->prepare("INSERT INTO inventory_logs "
                        . "(product_id, variant_id, previous_qty, change_qty, new_qty, reason, order_id, admin_id) "
                        . "VALUES (?, ?, ?, ?, ?, 'ORDER_DELETED', ?, ?)"
                    )->execute([
                        $item['product_id'], null, $prev,
                        $item['quantity'], $new, $order_id, $current_admin['id']
                    ]);
                }
            }
        }
    }

    // Free the discount usage consumed by this order.
    if (!empty($order['discount_code'])) {
        $pdo->prepare("UPDATE discounts SET times_used = GREATEST(times_used - 1, 0) WHERE code = ?")
            ->execute([$order['discount_code']]);
    }

    // order_items are deleted automatically by the order_id foreign key.
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$order_id]);

    $pdo->commit();
    header('Location: orders.php?deleted=1');
    exit;
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    header('Location: orders.php?delete_error=1');
    exit;
}
