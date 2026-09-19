<?php
// Shared product card, used on the homepage, collection page, and
// "related products" sections.
//
// Quick Add behaviour:
// - Products without variants are added immediately.
// - Products with variants open a small selector first, so the customer
//   chooses the exact variant/SKU before it is added to the cart.
function render_product_card($p) {
    global $pdo;

    $state = stock_state($p['stock'], $p['low_stock_threshold']);
    $has_discount = $p['compare_at_price'] && $p['compare_at_price'] > $p['price'];
    $discount_pct = $has_discount ? round((($p['compare_at_price'] - $p['price']) / $p['compare_at_price']) * 100) : 0;
    $image = $p['image'] ?: 'assets/images/placeholder.jpg';

    // Load active variants for this product. The cart system already
    // understands variant_id, so Quick Add can use the same mechanism.
    $variants = [];
    if ($pdo) {
        $stmt = $pdo->prepare("SELECT id, name, stock, price_override FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY id");
        $stmt->execute([(int)$p['id']]);
        $variants = $stmt->fetchAll();
    }
    $has_variants = count($variants) > 0;
    $modal_id = 'variantModal_' . (int)$p['id'] . '_' . uniqid();
    ?>
    <div class="product-card">
        <div class="product-card-image">
            <a href="product.php?slug=<?php echo h($p['slug']); ?>" class="product-card-image-link">
                <img src="<?php echo h($image); ?>" alt="<?php echo h($p['name']); ?>" loading="lazy">
                <?php if ($has_discount): ?>
                    <span class="badge">-<?php echo $discount_pct; ?>%</span>
                <?php endif; ?>
                <?php if ($state === 'OUT_OF_STOCK'): ?>
                    <span class="badge-stock">Out of Stock</span>
                <?php endif; ?>
            </a>

            <?php if ($has_variants && $state !== 'OUT_OF_STOCK'): ?>
                <button type="button" class="quick-add" onclick="openVariantModal('<?php echo h($modal_id); ?>')">Quick Add</button>
            <?php else: ?>
                <form method="POST" action="cart-action.php" class="quick-add-form">
                    <input type="hidden" name="action" value="add">
                    <input type="hidden" name="product_id" value="<?php echo (int)$p['id']; ?>">
                    <input type="hidden" name="quantity" value="1">
                    <input type="hidden" name="redirect" value="<?php echo h($_SERVER['REQUEST_URI']); ?>">
                    <button type="submit" class="quick-add" <?php echo $state === 'OUT_OF_STOCK' ? 'disabled' : ''; ?>>Quick Add</button>
                </form>
            <?php endif; ?>
        </div>

        <div class="product-card-info">
            <div>
                <a href="product.php?slug=<?php echo h($p['slug']); ?>"><h3><?php echo h($p['name']); ?></h3></a>
                <?php if ($state === 'LOW_STOCK'): ?>
                    <p class="low-stock-label"><?php echo stock_label($p['stock'], $p['low_stock_threshold']); ?></p>
                <?php endif; ?>
            </div>
            <div class="price">
                <?php echo format_price($p['price']); ?>
                <?php if ($has_discount): ?>
                    <span class="price-compare"><?php echo format_price($p['compare_at_price']); ?></span>
                <?php endif; ?>
            </div>
        </div>

        <?php if ($has_variants && $state !== 'OUT_OF_STOCK'): ?>
            <div class="variant-quick-modal" id="<?php echo h($modal_id); ?>" aria-hidden="true">
                <div class="variant-quick-backdrop" onclick="closeVariantModal('<?php echo h($modal_id); ?>')"></div>
                <div class="variant-quick-dialog" role="dialog" aria-modal="true" aria-label="Choose variant">
                    <button type="button" class="variant-quick-close" onclick="closeVariantModal('<?php echo h($modal_id); ?>')" aria-label="Close">&times;</button>
                    <p class="section-eyebrow">Quick Add</p>
                    <h3><?php echo h($p['name']); ?></h3>
                    <p class="variant-quick-note">Choose your preferred variant.</p>

                    <form method="POST" action="cart-action.php">
                        <input type="hidden" name="action" value="add">
                        <input type="hidden" name="product_id" value="<?php echo (int)$p['id']; ?>">
                        <input type="hidden" name="quantity" value="1">
                        <input type="hidden" name="redirect" value="<?php echo h($_SERVER['REQUEST_URI']); ?>">

                        <label class="variant-quick-label" for="variant_<?php echo (int)$p['id']; ?>">Variant</label>
                        <select name="variant_id" id="variant_<?php echo (int)$p['id']; ?>" class="variant-quick-select" required>
                            <option value="">Select a variant</option>
                            <?php foreach ($variants as $v): ?>
                                <option value="<?php echo (int)$v['id']; ?>" <?php echo (int)$v['stock'] <= 0 ? 'disabled' : ''; ?>>
                                    <?php echo h($v['name']); ?><?php echo (int)$v['stock'] <= 0 ? ' — Out of Stock' : ''; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>

                        <button type="submit" class="btn btn-primary btn-block variant-quick-submit">Add to Cart</button>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>
    <?php

    static $quick_add_script_printed = false;
    if (!$quick_add_script_printed) {
        $quick_add_script_printed = true;
        ?>
        <script>
        function openVariantModal(id) {
            var modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('variant-modal-open');

            var select = modal.querySelector('select');
            if (select) select.focus();
        }

        function closeVariantModal(id) {
            var modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('variant-modal-open');
        }

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var modal = document.querySelector('.variant-quick-modal.is-open');
            if (modal) closeVariantModal(modal.id);
        });
        </script>
        <?php
    }
}
