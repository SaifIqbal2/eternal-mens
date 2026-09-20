import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '../lib/api'
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

  useEffect(() => {
    setLoading(true)
    getProductBySlug(slug)
      .then(p => {
        if (!p) { setNotFound(true); return }
        setProduct(p)
        setMainImage(p.images?.[0]?.url || '/assets/images/1.jpg')
        if (p.variants?.length > 0) setSelectedVariant(p.variants[0])
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
            {/* Images */}
            <div>
              <div className="product-main-image">
                <img src={mainImage} alt={product.name} id="mainImage" style={{ width: '100%', display: 'block' }} />
              </div>
              {product.images?.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(img.url)}
                      style={{
                        width: '72px', height: '72px', border: mainImage === img.url ? '2px solid var(--ink)' : '1px solid var(--hairline)',
                        padding: 0, background: 'none', cursor: 'pointer', overflow: 'hidden'
                      }}
                    >
                      <img src={img.url} alt={img.alt_text || product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="section-eyebrow" style={{ marginBottom: '0.5rem' }}>{product.brand}</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{product.name}</h1>

              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span className="mono" style={{ fontSize: '1.5rem' }}>
                  Rs {Number(effectivePrice).toLocaleString()}
                </span>
                {product.compare_at_price && (
                  <span className="mono price-compare" style={{ fontSize: '1rem' }}>
                    Rs {Number(product.compare_at_price).toLocaleString()}
                  </span>
                )}
              </div>

              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: inStock ? 'var(--success)' : 'var(--danger)' }}>
                {inStock ? 'In Stock' : 'Out of Stock'}
                {inStock && maxQty <= product.low_stock_threshold && ` — Only ${maxQty} left`}
              </p>

              {/* Variants */}
              {product.variants?.filter(v => v.is_active).length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    {product.variants[0].option_type}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.variants.filter(v => v.is_active).map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          border: selectedVariant?.id === v.id ? '2px solid var(--ink)' : '1px solid var(--hairline)',
                          background: 'transparent',
                          cursor: v.stock > 0 ? 'pointer' : 'not-allowed',
                          opacity: v.stock > 0 ? 1 : 0.4,
                        }}
                        disabled={v.stock === 0}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ marginTop: '1.5rem', color: 'var(--graphite)', lineHeight: 1.7 }}>
                {product.description}
              </p>

              {/* Add to cart */}
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
                    className="btn btn-primary"
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

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="section section-muted" id="reviews">
          <div className="container">
            <h2 className="section-heading">Customer Reviews</h2>
            <div className="review-grid">
              {product.reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  {r.title && <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{r.title}</strong>}
                  <p>{r.body}</p>
                  <p className="review-author">{r.author_name}</p>
                </div>
              ))}
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
