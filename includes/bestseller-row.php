<?php
// Ranked-list row for Best Sellers — deliberately different from the
// standard product-card grid, since "best seller" implies a ranking.
// Works on both light and dark section backgrounds (pass $dark = true
// when placing it inside a .section-dark block).
function render_bestseller_row($p, $rank, $dark = false) {
    $state = stock_state($p['stock'], $p['low_stock_threshold']);
    $has_discount = $p['compare_at_price'] && $p['compare_at_price'] > $p['price'];
    $image = $p['image'] ?: 'assets/images/placeholder.jpg';
    $rank_label = str_pad((string)$rank, 2, '0', STR_PAD_LEFT);
    ?>
    <div class="bestseller-row <?php echo $dark ? 'on-dark' : ''; ?>">
        <span class="bestseller-rank"><?php echo h($rank_label); ?></span>
        <a href="product.php?slug=<?php echo h($p['slug']); ?>" class="bestseller-thumb">
            <img src="<?php echo h($image); ?>" alt="<?php echo h($p['name']); ?>" loading="lazy">
        </a>
        <div class="bestseller-info">
            <a href="product.php?slug=<?php echo h($p['slug']); ?>"><h3><?php echo h($p['name']); ?></h3></a>
            <?php if ($state === 'LOW_STOCK'): ?>
                <p class="low-stock-label"><?php echo stock_label($p['stock'], $p['low_stock_threshold']); ?></p>
            <?php endif; ?>
        </div>
        <div class="bestseller-price">
            <span class="mono"><?php echo format_price($p['price']); ?></span>
            <?php if ($has_discount): ?>
                <span class="mono price-compare"><?php echo format_price($p['compare_at_price']); ?></span>
            <?php endif; ?>
        </div>
    </div>
    <?php
}