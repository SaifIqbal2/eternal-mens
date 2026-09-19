<?php
session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/helpers.php';

if (!empty($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_name'] = $admin['name'];
        $_SESSION['admin_role'] = $admin['role'];
        header('Location: index.php');
        exit;
    } else {
        $error = 'Incorrect email or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | Eternal Mens</title>
    <link rel="stylesheet" href="../assets/css/admin.css?v=<?php echo @filemtime(__DIR__ . '/../assets/css/admin.css') ?: time(); ?>">
</head>
<body>
<div class="login-shell">
    <div class="login-box">
        <h1>Eternal Mens Admin</h1>
        <?php if ($error): ?><div class="alert alert-error"><?php echo h($error); ?></div><?php endif; ?>
        <form method="POST" action="login.php">
            <div class="form-row">
                <label>Email</label>
                <input type="email" name="email" required autofocus value="<?php echo h($_POST['email'] ?? ''); ?>">
            </div>
            <div class="form-row">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Log In</button>
        </form>
    </div>
</div>
</body>
</html>
