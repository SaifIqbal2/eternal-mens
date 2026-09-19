<?php
// Include this at the very top of every protected admin page.
// Redirects to login if not authenticated.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

if (empty($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$current_admin = [
    'id' => $_SESSION['admin_id'],
    'name' => $_SESSION['admin_name'],
    'role' => $_SESSION['admin_role'],
];
