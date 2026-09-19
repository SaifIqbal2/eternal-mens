<?php
// ============================================================
// DATABASE CONNECTION
// Every page includes this file to talk to MySQL.
// Uses PDO with prepared statements everywhere (protects against
// SQL injection automatically, as long as you always use ? placeholders).
// ============================================================

$DB_HOST = 'localhost';
$DB_NAME = 'eternal_mens_store';
$DB_USER = 'root';   // XAMPP's default MySQL user
$DB_PASS = '';        // XAMPP's default MySQL password (blank)

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    // In production you'd log this instead of showing it to visitors.
    die('Database connection failed: ' . $e->getMessage() .
        '<br><br>Check that MySQL is running in XAMPP and that you created the database (see database/schema.sql).');
}
