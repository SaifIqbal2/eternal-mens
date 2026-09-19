<?php
require_once 'includes/auth.php';

// Approve / unapprove a review.
if (isset($_GET['approve'])) {
    $id = (int)$_GET['approve'];
    $pdo->prepare("UPDATE reviews SET is_approved = 1 WHERE id = ?")->execute([$id]);
    header('Location: reviews.php?saved=1');
    exit;
}

if (isset($_GET['unapprove'])) {
    $id = (int)$_GET['unapprove'];
    $pdo->prepare("UPDATE reviews SET is_approved = 0 WHERE id = ?")->execute([$id]);
    header('Location: reviews.php?saved=1');
    exit;
}

// Delete a review.
if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    $pdo->prepare("DELETE FROM reviews WHERE id = ?")->execute([$id]);
    header('Location: reviews.php?deleted=1');
    exit;
}

$reviews = $pdo->query("
    SELECT r.*, p.name AS product_name
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC
")->fetchAll();

$page_title = 'Reviews';
$active_nav = 'reviews';
require_once 'includes/admin-header.php';
?>

<?php if (isset($_GET['saved'])): ?><div class="alert alert-success">Review status updated.</div><?php endif; ?>
<?php if (isset($_GET['deleted'])): ?><div class="alert alert-success">Review deleted.</div><?php endif; ?>

<div class="panel">
    <div class="flex-between">
        <div>
            <h2>Customer Reviews</h2>
            <p class="text-soft" style="margin-top:0.35rem;">New reviews stay hidden until you approve them.</p>
        </div>
    </div>

    <?php if (count($reviews) === 0): ?>
        <div class="empty">No customer reviews yet.</div>
    <?php else: ?>
    <div class="table-wrap">
    <table>
        <tr><th>Product</th><th>Customer</th><th>Order</th><th>Rating</th><th>Review</th><th>Media</th><th>Status</th><th>Submitted</th><th></th></tr>
        <?php foreach ($reviews as $r): ?>
        <tr>
            <td><?php echo h($r['product_name']); ?></td>
            <td><?php echo h($r['author_name']); ?></td>
            <td class="mono"><?php echo !empty($r['order_id']) ? 'Verified' : '—'; ?></td>
            <td class="mono"><?php echo str_repeat('★', (int)$r['rating']) . str_repeat('☆', 5 - (int)$r['rating']); ?></td>
            <td style="max-width:320px;">
                <?php if (!empty($r['title'])): ?><strong><?php echo h($r['title']); ?></strong><br><?php endif; ?>
                <?php
                    $review_text = $r['body'];
                    echo h(mb_strlen($review_text) > 100 ? mb_substr($review_text, 0, 100) . '…' : $review_text);
                ?>
            </td>
            <td>
                <?php if (!empty($r['media_url'])): ?>
                    <?php if (($r['media_type'] ?? '') === 'VIDEO'): ?>
                        <video controls preload="metadata" style="width:120px; max-height:90px;"><source src="../<?php echo h($r['media_url']); ?>"></video>
                    <?php else: ?>
                        <a href="../<?php echo h($r['media_url']); ?>" target="_blank"><img src="../<?php echo h($r['media_url']); ?>" alt="Review media" style="width:90px;height:70px;object-fit:cover;"></a>
                    <?php endif; ?>
                <?php else: ?>—<?php endif; ?>
            </td>
            <td>
                <?php if ($r['is_approved']): ?>
                    <span class="badge-status badge-ACTIVE">Approved</span>
                <?php else: ?>
                    <span class="badge-status badge-PENDING">Pending</span>
                <?php endif; ?>
            </td>
            <td class="text-soft"><?php echo date('d M Y, g:ia', strtotime($r['created_at'])); ?></td>
            <td style="white-space:nowrap;">
                <?php if ($r['is_approved']): ?>
                    <a href="reviews.php?unapprove=<?php echo (int)$r['id']; ?>" class="btn btn-outline btn-sm">Hide</a>
                <?php else: ?>
                    <a href="reviews.php?approve=<?php echo (int)$r['id']; ?>" class="btn btn-primary btn-sm">Approve</a>
                <?php endif; ?>
                <a href="reviews.php?delete=<?php echo (int)$r['id']; ?>" class="btn btn-danger btn-sm" onclick="return confirm('Delete this review? This cannot be undone.');">Delete</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/admin-footer.php'; ?>
