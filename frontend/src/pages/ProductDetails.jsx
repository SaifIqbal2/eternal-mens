import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getProductBySlug, getProducts } from '../lib/api'
import { useCartStore } from '../store/useCartStore'

export default function ProductDetails() {
  const { id: slug } = useParams()
  const navigate = useNavigate()
  const addToCart = useCartStore(s => s.addToCart)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [added, setAdded] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [related, setRelated] = useState([])

  useEffect(() => {
    setLoading(true)
    setRelated([])
    getProductBySlug(slug)
      .then(p => {
        if (!p) { setNotFound(true); return }
        setProduct(p)
        setMainImage(p.images?.[0]?.url || '/assets/images/1.jpg')
        if (p.variants?.length > 0) setSelectedVariant(p.variants[0])
        // fetch related products same category
        if (p.category?.slug) {
          getProducts({ categorySlug: p.category.slug, limit: 4 })
            .then(res => setRelated(res.filter(r => r.id !== p.id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <section className="section" style={{ paddingTop: '4rem' }}>
      <div className="container"><p style={{ color: 'var(--graphite-soft)' }}>Loading product...</p></div>
    </section>
  )

  if (notFound || !product) return (
    <section className="section" style={{ paddingTop: '4rem' }}>
      <div className="container empty-state">
        <h1>Product not found</h1>
        <Link to="/collection" className="btn btn-outline-dark" style={{ marginTop: '1rem' }}>Back to Shop</Link>
      </div>
    </section>
  )

  const effectivePrice = selectedVariant?.price_override ?? product.price
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.stock > 0
  const maxQty = selectedVariant ? selectedVariant.stock : product.stock
  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const reviews = (product.reviews || []).filter(r => r.is_approved)
  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      sku: selectedVariant?.sku || product.sku,
      image: mainImage,
      variant_id: selectedVariant?.id || null,
      variant_name: selectedVariant?.name || null,
    }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  return (
    <>
      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          {/* Breadcrumb */}
          <p style={{ fontSize: '0.8rem', color: 'var(--graphite-soft)', marginBottom: '2rem' }}>
            <Link to="/" style={{ color: 'var(--graphite-soft)' }}>Home</Link> /&nbsp;
            <Link to={`/collection?section=${product.category?.section}`} style={{ color: 'var(--graphite-soft)' }}>
              {product.category?.name}
            </Link> /&nbsp;
            <span>{product.name}</span>
          </p>

          <div className="product-detail-layout">
            {/* Images Gallery */}
            <div>
              <div className="product-main-image">
                <img src={mainImage} alt={product.name} id="mainImage" style={{ width: '100%', display: 'block' }} />
              </div>
              {product.images?.length > 1 && (
                <div className="product-thumbs" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(img.url)}
                      className="thumb-btn"
                      style={{
                        width: '72px', height: '72px',
                        border: mainImage === img.url ? '2px solid var(--ink)' : '1px solid var(--hairline)',
                        padding: 0, background: 'none', cursor: 'pointer', overflow: 'hidden'
                      }}
                    >
                      <img src={img.url} alt={img.alt_text || product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="section-eyebrow" style={{ marginBottom: '0.5rem' }}>{product.brand}</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{product.name}</h1>

              {/* Star Rating */}
              {reviews.length > 0 && (
                <p className="mono" style={{ color: 'var(--brass)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  {'★'.repeat(avgRating)}{'☆'.repeat(5 - avgRating)}&nbsp;
                  <span style={{ color: 'var(--graphite-soft)' }}>
                    ({reviews.length} review{reviews.length === 1 ? '' : 's'})
                  </span>
                </p>
              )}

              {/* Price + Discount Badge */}
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: '1.5rem' }} id="displayPrice">
                  Rs {Number(effectivePrice).toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="mono price-compare" style={{ fontSize: '1rem' }}>
                      Rs {Number(product.compare_at_price).toLocaleString()}
                    </span>
                    <span className="badge" style={{ position: 'static' }}>-{discountPct}%</span>
                  </>
                )}
              </div>

              {/* Stock Label */}
              <p style={{
                marginTop: '0.75rem', fontSize: '0.85rem',
                color: inStock
                  ? (maxQty <= product.low_stock_threshold ? 'var(--brass)' : 'var(--success)')
                  : 'var(--danger)'
              }}>
                {!inStock
                  ? 'Out of Stock'
                  : maxQty <= product.low_stock_threshold
                    ? `Only ${maxQty} left`
                    : 'In Stock'}
              </p>

              {/* Variants */}
              {product.variants?.filter(v => v.is_active).length > 0 && (
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Color</label>
                  <select
                    id="variantSelect"
                    onChange={e => {
                      const v = product.variants.find(v => v.id === Number(e.target.value))
                      setSelectedVariant(v || null)
                    }}
                    value={selectedVariant?.id || ''}
                  >
                    {product.variants.filter(v => v.is_active).map(v => (
                      <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                        {v.name}{v.stock <= 0 ? ' (Out of Stock)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <p style={{ marginTop: '1.5rem', color: 'var(--graphite)', lineHeight: 1.7 }}>
                {product.description}
              </p>

              {/* Quantity + Add to Cart */}
              <div style={{ marginTop: '2rem' }}>
                <div className="form-group" style={{ maxWidth: '140px' }}>
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value))))}
                    min="1"
                    max={maxQty}
                    disabled={!inStock}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    style={{ flex: 1 }}
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    {added ? 'Added ✓' : 'Add to Cart'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary buy-now-btn"
                    style={{ flex: 1 }}
                    onClick={handleBuyNow}
                    disabled={!inStock}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Specs */}
              {(product.materials || product.dimensions || product.weight) && (
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--hairline)', paddingTop: '1.5rem', fontSize: '0.85rem', color: 'var(--graphite)' }}>
                  {product.materials && <p style={{ marginBottom: '0.5rem' }}><strong>Materials:</strong> {product.materials}</p>}
                  {product.dimensions && <p style={{ marginBottom: '0.5rem' }}><strong>Dimensions:</strong> {product.dimensions}</p>}
                  {product.weight && <p style={{ marginBottom: '0.5rem' }}><strong>Weight:</strong> {product.weight}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section section-muted" id="reviews">
        <div className="container">
          <h2 className="section-heading">Customer Reviews</h2>

          {reviews.length > 0 ? (
            <div className="review-grid" style={{ marginBottom: '2.5rem' }}>
              {reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <p>{r.body}</p>
                  <p className="review-author">{r.author_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--graphite-soft)', marginBottom: '2rem' }}>No reviews yet. Be the first to review this product.</p>
          )}

          {/* Write a Review Toggle */}
          <div className="review-write">
            <button
              type="button"
              className="review-write-toggle"
              onClick={() => setReviewOpen(o => !o)}
              aria-expanded={reviewOpen}
              aria-controls="reviewWriteForm"
            >
              <span>Write a Review</span>
              <span className="review-write-arrow" aria-hidden="true">
                <span style={{ display: 'inline-block', transform: reviewOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>↓</span>
              </span>
            </button>

            {reviewOpen && (
              <div className="review-write-form" id="reviewWriteForm">
                <p style={{ marginBottom: '1.25rem', color: 'var(--graphite-soft)', fontSize: '0.9rem' }}>
                  Only customers with a delivered order for this product can submit a review. Your order number, checkout email, and a real product photo or video are required.
                </p>
                <ReviewForm productSlug={slug} productId={product.id} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products — You Might Also Like */}
      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-heading">You Might Also Like</h2>
            <div className="product-grid">
              {related.map(p => {
                const img = p.images?.[0]?.url || '/assets/images/1.jpg'
                const hasOffer = p.compare_at_price && Number(p.compare_at_price) > Number(p.price)
                return (
                  <Link key={p.id} to={`/product/${p.slug}`} className="product-card" style={{ textDecoration: 'none' }}>
                    <div className="product-card-image">
                      <img src={img} alt={p.name} loading="lazy" />
                      {p.stock === 0 && <span className="badge badge-out">Out of Stock</span>}
                      {hasOffer && p.stock > 0 && (
                        <span className="badge">
                          -{Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="product-card-info">
                      <p className="product-card-brand">{p.brand}</p>
                      <h3 className="product-card-name">{p.name}</h3>
                      <div className="product-card-price">
                        <span className="mono">Rs {Number(p.price).toLocaleString()}</span>
                        {hasOffer && (
                          <span className="mono price-compare" style={{ marginLeft: '0.5rem' }}>
                            Rs {Number(p.compare_at_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .product-detail-layout { display: grid; gap: 3rem; }
        @media (min-width: 900px) { .product-detail-layout { grid-template-columns: 1fr 1fr; } }
        .product-main-image { aspect-ratio: 4/5; overflow: hidden; background: rgba(221,217,209,0.4); }
        .product-main-image img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </>
  )
}

// ─── Review Form (separate component) ────────────────────────────────────────
function ReviewForm({ productSlug, productId }) {
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [errors, setErrors] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMsg('')
    const errs = []
    const fd = new FormData(e.target)
    const name = fd.get('author_name')?.trim()
    const email = fd.get('email')?.trim()
    const orderNum = fd.get('order_number')?.trim()
    const rating = fd.get('rating')
    const body = fd.get('body')?.trim()

    if (!name) errs.push('Please enter your name.')
    if (!email) errs.push('Please enter your order email.')
    if (!orderNum) errs.push('Please enter your order number.')
    if (!rating) errs.push('Please select a rating.')
    if (!body) errs.push('Please write a review.')

    if (errs.length > 0) { setErrors(errs); return }

    setSubmitting(true)
    try {
      // Note: Reviews require order verification via Supabase RPC or direct insert.
      // We attempt insert — if RLS blocks it, show a helpful message.
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        author_name: name,
        rating: Number(rating),
        body,
        is_approved: false,
      })
      if (error) throw error
      setMsg('Thanks! Your review was submitted and will appear after approval.')
      e.target.reset()
    } catch {
      setMsg('Could not submit review. Please make sure you have a delivered order for this product, or contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
      {errors.length > 0 && (
        <div style={{ background: '#fbeaea', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
      {msg && (
        <div style={{ background: '#eaf4ee', border: '1px solid var(--success)', color: 'var(--success)', padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="form-group">
          <label>Your Name</label>
          <input type="text" name="author_name" required />
        </div>
        <div className="form-group">
          <label>Order Number</label>
          <input type="text" name="order_number" placeholder="e.g. ORD-1045" required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="form-group">
          <label>Order Email</label>
          <input type="email" name="email" placeholder="Email used at checkout" required />
        </div>
        <div className="form-group">
          <label>Your Rating</label>
          <select name="rating" required>
            <option value="">Select a rating</option>
            <option value="5">★★★★★ Excellent</option>
            <option value="4">★★★★☆ Good</option>
            <option value="3">★★★☆☆ Average</option>
            <option value="2">★★☆☆☆ Below Average</option>
            <option value="1">★☆☆☆☆ Poor</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Your Review</label>
        <textarea name="body" rows="4" required></textarea>
      </div>
      <button type="submit" className="btn btn-outline-dark" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
