<?php
require_once 'includes/auth.php';

// Mark as read when opened
if (isset($_GET['view'])) {
    $id = (int)$_GET['view'];
    $pdo->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?")->execute([$id]);
}

// Delete
if (isset($_GET['delete'])) {
    $pdo->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([(int)$_GET['delete']]);
    header('Location: messages.php?deleted=1');
    exit;
}

$messages = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC")->fetchAll();
$unread_count = 0;
foreach ($messages as $m) { if (!$m['is_read']) $unread_count++; }

$viewing = null;
if (isset($_GET['view'])) {
    foreach ($messages as $m) {
        if ($m['id'] == (int)$_GET['view']) { $viewing = $m; break; }
    }
}

$page_title = 'Messages';
$active_nav = 'messages';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['deleted'])): ?><div class="alert alert-success">Message deleted.</div><?php endif; ?>

<div class="panel">
    <div class="flex-between">
        <h2>Contact Messages <?php if ($unread_count > 0): ?><span class="badge-status badge-PENDING"><?php echo $unread_count; ?> unread</span><?php endif; ?></h2>
    </div>

    <?php if (count($messages) === 0): ?>
        <p class="empty">No messages yet — they'll show up here as soon as someone uses your Contact page.</p>
    <?php else: ?>
    <div class="table-wrap">
    <table>
        <tr><th>From</th><th>Message</th><th>Received</th><th></th><th></th></tr>
        <?php foreach ($messages as $m): ?>
        <tr style="<?php echo $m['is_read'] ? '' : 'font-weight:600;'; ?>">
            <td>
                <?php echo h($m['name']); ?><br>
                <span class="text-soft" style="font-weight:400; font-size:0.78rem;"><?php echo h($m['email']); ?></span>
            </td>
            <td style="max-width:320px;">
                <?php echo h(mb_strlen($m['message']) > 80 ? mb_substr($m['message'], 0, 80) . '…' : $m['message']); ?>
            </td>
            <td class="text-soft" style="font-weight:400;"><?php echo date('d M Y, g:ia', strtotime($m['created_at'])); ?></td>
            <td><a href="messages.php?view=<?php echo $m['id']; ?>" class="btn btn-outline btn-sm">View</a></td>
            <td><a href="messages.php?delete=<?php echo $m['id']; ?>" class="btn btn-danger btn-sm" onclick="return confirm('Delete this message?');">Delete</a></td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php endif; ?>
</div>

<?php if ($viewing): ?>
<div class="panel">
    <h2>Message from <?php echo h($viewing['name']); ?></h2>
    <p class="text-soft" style="margin-bottom:1rem;">
        <?php echo h($viewing['email']); ?> — <?php echo date('d M Y, g:ia', strtotime($viewing['created_at'])); ?>
    </p>
    <p style="white-space:pre-wrap; line-height:1.6;"><?php echo h($viewing['message']); ?></p>
    <div class="mt-1">
        <a href="mailto:<?php echo h($viewing['email']); ?>" class="btn btn-primary">Reply by Email</a>
        <a href="messages.php" class="btn btn-outline">Close</a>
    </div>
</div>
<?php endif; ?>

<?php require_once 'includes/admin-footer.php'; ?>
