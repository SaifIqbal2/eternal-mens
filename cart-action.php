<?php
// ============================================================
// CART ACTIONS — add / update / remove
// Cart is stored in $_SESSION['cart'] as:
//   [ "productId" or "productId-variantId" => ['product_id'=>.., 'variant_id'=>.., 'quantity'=>..] ]
// We only ever store IDs + quantity in the session — price, name,
// and stock are always re-checked fresh from the database, so the
// cart can never show stale/wrong prices.
// ============================================================

session_start();
require_once __DIR__ . '/includes/db.php';

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$action = $_POST['action'] ?? '';
$product_id = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
$variant_id = (!empty($_POST['variant_id'])) ? (int)$_POST['variant_id'] : null;
$redirect = $_POST['redirect'] ?? 'cart.php';
$added_ok = false;

function cart_key($product_id, $variant_id) {
    return $variant_id ? "$product_id-$variant_id" : "$product_id";
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $product_id > 0) {

    if ($action === 'add') {
        $quantity = max(1, (int)($_POST['quantity'] ?? 1));

        // Work out available stock for this exact line (product or variant)
        if ($variant_id) {
            $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ? AND product_id = ?");
            $stmt->execute([$variant_id, $product_id]);
        } else {
            $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
            $stmt->execute([$product_id]);
        }
        $row = $stmt->fetch();

        if ($row && $row['stock'] > 0) {
            $key = cart_key($product_id, $variant_id);
            $existing_qty = $_SESSION['cart'][$key]['quantity'] ?? 0;
            $new_qty = min($existing_qty + $quantity, (int)$row['stock']);

            $_SESSION['cart'][$key] = [
                'product_id' => $product_id,
                'variant_id' => $variant_id,
                'quantity' => $new_qty,
            ];
            $added_ok = true;
        }
    }

    if ($action === 'update') {
        $key = cart_key($product_id, $variant_id);
        $quantity = (int)($_POST['quantity'] ?? 1);

        if ($quantity <= 0) {
            unset($_SESSION['cart'][$key]);
        } elseif (isset($_SESSION['cart'][$key])) {
            // clamp to available stock
            if ($variant_id) {
                $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = ?");
                $stmt->execute([$variant_id]);
            } else {
                $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
                $stmt->execute([$product_id]);
            }
            $row = $stmt->fetch();
            $max_stock = $row ? (int)$row['stock'] : $quantity;
            $_SESSION['cart'][$key]['quantity'] = min($quantity, max($max_stock, 1));
        }
    }

    if ($action === 'remove') {
        $key = cart_key($product_id, $variant_id);
        unset($_SESSION['cart'][$key]);
    }
}

// ---- AJAX callers (Quick Add / Add to Cart via JS) get JSON back and no redirect ----
$is_ajax = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest' || ($_POST['ajax'] ?? '') === '1';
if ($is_ajax) {
    $cart_count = 0;
    foreach ($_SESSION['cart'] as $line) {
        $cart_count += $line['quantity'];
    }
    header('Content-Type: application/json');
    echo json_encode(['success' => $added_ok || $action !== 'add', 'cart_count' => $cart_count]);
    exit;
}

if ($added_ok) {
    $separator = (strpos($redirect, '?') !== false) ? '&' : '?';
    $redirect .= $separator . 'added=1';
}

header('Location: ' . $redirect);
exit;
