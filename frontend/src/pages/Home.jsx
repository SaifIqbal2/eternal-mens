import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts, getCategories, subscribeNewsletter } from '../lib/api'

function ProductCard({ p }) {
  const img = p.images?.[0]?.url || '/assets/images/1.jpg'
  return (
    <div className="product-card">
      <div className="product-card-image">
        <Link to={`/product/${p.slug}`} className="product-card-image-link">
          <img src={img} alt={p.name} loading="lazy" />
        </Link>
        <Link to={`/product/${p.slug}`} className="quick-add">View Product</Link>
      </div>
      <div className="product-card-info">
        <div>
          <Link to={`/product/${p.slug}`}><h3>{p.name}</h3></Link>
          {p.stock > 0 && p.stock <= p.low_stock_threshold && (
            <p className="low-stock-label">Only {p.stock} left</p>
          )}
        </div>
        <div className="price">
          {p.compare_at_price && (
            <span className="price-compare">Rs {Number(p.compare_at_price).toLocaleString()}</span>
          )}
          Rs {Number(p.price).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [accessoryCategories, setAccessoryCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')

  useEffect(() => {
    getFeaturedProducts(8, 'watches')
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setLoading(false))

    getCategories('accessories')
      .then(setAccessoryCategories)
      .catch(console.error)
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    try {
      await subscribeNewsletter(email)
      setSubMsg('Subscribed! Thank you.')
      setEmail('')
    } catch {
      setSubMsg('Something went wrong. Try again.')
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <img src="/assets/images/hero.jpeg" alt="Eternal Mens watch" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <p className="eyebrow">Eternal Mens — Timepieces</p>
          <h1>Time,<br /><em>Redefined.</em></h1>
          <p className="hero-description">
            Precision movements, considered detail, and materials built to outlast trend cycles.
          </p>
          <div className="hero-actions">
            <Link to="/collection?section=watches" className="btn btn-light">Shop Watches</Link>
          </div>
        </div>
        <div className="hero-meta">
          <span className="hero-meta-line"></span>
          <span>ETERNAL MENS</span>
        </div>
        <div className="hero-scroll">
          <span>Scroll to explore</span>
          <span className="hero-scroll-line"></span>
        </div>
      </section>

      {/* CATEGORY ORBITS */}
      <section className="section category-orbits-section reveal">
        <div className="container">
          <p className="section-eyebrow text-center">Shop by Category</p>
          <h2 className="section-heading text-center">Find Your Piece</h2>
          <div className="category-orbits">
            <Link to="/collection?section=watches" className="category-orb">
              <span className="category-orb-visual" style={{ position: 'relative', display: 'block', width: '180px', height: '180px' }}>
                <svg className="orb-arc orb-arc-1" viewBox="0 0 160 160" width="180" height="180" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fill: 'none' }}>
                  <path d="M 19.6 106.5 A 66 66 0 0 1 106.5 19.6" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <svg className="orb-arc orb-arc-2" viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fill: 'none' }}>
                  <path d="M 140.4 53.5 A 66 66 0 0 1 53.5 140.4" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="category-orb-image" style={{ position: 'absolute', inset: '30px', borderRadius: '50%', overflow: 'hidden', display: 'block', background: '#ddd9d1' }}>
                  <img src="/assets/images/categories/watches.jpg" alt="Watches" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </span>
              </span>
              <span className="category-orb-label">Watches</span>
            </Link>

            {accessoryCategories.map(cat => (
              <Link key={cat.id} to={`/collection?section=accessories&category=${cat.slug}`} className="category-orb">
                <span className="category-orb-visual" style={{ position: 'relative', display: 'block', width: '180px', height: '180px' }}>
                  <svg className="orb-arc orb-arc-1" viewBox="0 0 160 160" width="180" height="180" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fill: 'none' }}>
                    <path d="M 19.6 106.5 A 66 66 0 0 1 106.5 19.6" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <svg className="orb-arc orb-arc-2" viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', fill: 'none' }}>
                    <path d="M 140.4 53.5 A 66 66 0 0 1 53.5 140.4" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="category-orb-image" style={{ position: 'absolute', inset: '30px', borderRadius: '50%', overflow: 'hidden', display: 'block', background: '#ddd9d1' }}>
                    <img src={cat.image || `/assets/images/categories/${cat.slug}.jpg`} alt={cat.name} onError={(e) => { e.currentTarget.src = '/assets/images/bracelets.jpg' }} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </span>
                </span>
                <span className="category-orb-label">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="section section-dark reveal">
        <div className="container brand-statement">
          <div className="brand-statement-image">
            <img src="/assets/images/brandS.jpeg" alt="Eternal Mens style" />
          </div>
          <div>
            <p className="section-eyebrow">Our Philosophy</p>
            <h2>Designed for the modern man.</h2>
            <p>Every piece we make is judged against three things: style that doesn't date, quality that holds up to daily wear, and the kind of detail you only notice up close.</p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {(loading || featured.length > 0) && (
        <section className="section reveal">
          <div className="container">
            <p className="section-eyebrow">New In</p>
            <h2 className="section-heading">Latest Arrivals</h2>
            {loading ? (
              <p style={{ color: 'var(--graphite-soft)' }}>Loading products...</p>
            ) : (
              <div className="product-grid">
                {featured.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/collection?section=watches" className="btn btn-outline-dark">View All Watches</Link>
            </div>
          </div>
        </section>
      )}

      {/* TRUST GRID */}
      <section className="section reveal">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M6 3h12l-1 12-5 4-5-4L6 3z"/></svg>
              <h3>Quality Products</h3>
              <p>Precision-built pieces, inspected before they ship.</p>
            </div>
            <div className="trust-item">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>
              <h3>Secure Payments</h3>
              <p>Your details are protected, every transaction.</p>
            </div>
            <div className="trust-item">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><rect x="1" y="6" width="15" height="12"/><path d="M16 10h4l3 3v5h-7"/></svg>
              <h3>Fast Delivery</h3>
              <p>Nationwide dispatch within 24–48 hours.</p>
            </div>
            <div className="trust-item">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M3 12a9 9 0 109-9"/><path d="M3 4v5h5"/></svg>
              <h3>Easy Returns</h3>
              <p>14-day hassle-free returns, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section reveal">
        <div className="container">
          <h2 className="section-heading">In Their Words</h2>
          <div className="review-grid">
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"The build quality is far beyond what I expected at this price. Strap feels premium too."</p>
              <p className="review-author">Ahmed R.</p>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Fast delivery, and the packaging alone felt like unboxing something twice the price."</p>
              <p className="review-author">Bilal K.</p>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★☆</div>
              <p>"Exactly as described. Customer support was quick to answer my sizing question."</p>
              <p className="review-author">Hamza S.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section section-dark reveal">
        <div className="container newsletter">
          <h2>Join the List</h2>
          <p>New arrivals, early access, and the occasional private discount. No spam.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-light">Subscribe</button>
          </form>
          {subMsg && <p className="newsletter-message">{subMsg}</p>}
        </div>
      </section>
    </>
  )
}
