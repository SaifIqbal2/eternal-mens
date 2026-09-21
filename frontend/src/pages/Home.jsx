import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedPieces, getBestsellers, getNewArrivals, subscribeNewsletter, getCategories } from '../lib/api'
import { useCartStore } from '../store/useCartStore'

export default function Home() {
  const addToCart = useCartStore((s) => s.addToCart)

  const [navCategories, setNavCategories] = useState([])
  const [featuredPieces, setFeaturedPieces] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [arrivalsIndex, setArrivalsIndex] = useState(0)
  const [addedId, setAddedId] = useState(null)

  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')

  const arrivalsTrackRef = useRef(null)

  useEffect(() => {
    Promise.all([
      getCategories().then(setNavCategories).catch(console.error),
      getFeaturedPieces(6).then(setFeaturedPieces).catch(console.error),
      getBestsellers(6).then(setBestsellers).catch(console.error),
      getNewArrivals(8).then(setNewArrivals).catch(console.error),
    ]).finally(() => setLoading(false))
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

  const handleAddBestseller = (product) => {
    addToCart(product, 1)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  // Featured Carousel Navigation
  const prevFeatured = () => {
    if (featuredPieces.length === 0) return
    setFeaturedIndex((i) => (i - 1 + featuredPieces.length) % featuredPieces.length)
  }

  const nextFeatured = () => {
    if (featuredPieces.length === 0) return
    setFeaturedIndex((i) => (i + 1) % featuredPieces.length)
  }

  // Arrivals Carousel Navigation
  const getArrivalsPerPage = () => typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4

  const prevArrivals = () => {
    if (newArrivals.length === 0) return
    setArrivalsIndex((i) => Math.max(0, i - 1))
  }

  const nextArrivals = () => {
    if (newArrivals.length === 0) return
    const perPage = getArrivalsPerPage()
    const maxIndex = Math.max(0, newArrivals.length - perPage)
    setArrivalsIndex((i) => Math.min(maxIndex, i + 1))
  }

  const activeFeatured = featuredPieces[featuredIndex]

  return (
    <>
      {/* HERO SECTION */}
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

      {/* SECTION 1: CATEGORY ORBITS (FIND YOUR PIECE) */}
      <section className="section category-orbits-section reveal in-view">
        <div className="container">
          <p className="section-eyebrow text-center">Shop by Category</p>
          <h2 className="section-heading text-center">Find Your Piece</h2>
          <div className="category-orbits">
            
            {/* Fixed Overall Watches Category */}
            <Link to="/collection?section=watches" className="category-orb">
              <span className="category-orb-visual">
                <svg className="orb-arc orb-arc-1" viewBox="0 0 160 160" aria-hidden="true">
                  <path d="M 19.6 106.5 A 66 66 0 0 1 106.5 19.6" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <svg className="orb-arc orb-arc-2" viewBox="0 0 160 160" aria-hidden="true">
                  <path d="M 140.4 53.5 A 66 66 0 0 1 53.5 140.4" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="category-orb-image" style={{ position: 'absolute', inset: '30px', borderRadius: '50%', overflow: 'hidden', display: 'block', background: '#ddd9d1' }}>
                  <img
                    src="/assets/images/1.jpg"
                    alt="Watches"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </span>
              </span>
              <span className="category-orb-label">Watches</span>
            </Link>

            {/* Only Accessories Categories */}
            {navCategories.filter(cat => cat.section !== 'watches').map((cat) => {
              const link = `/collection?section=accessories&category=${cat.slug}`
              const image = cat.image_url || `/assets/images/categories/${cat.slug}.jpg`
              return (
              <Link key={cat.slug} to={link} className="category-orb">
                <span className="category-orb-visual">
                  <svg className="orb-arc orb-arc-1" viewBox="0 0 160 160" aria-hidden="true">
                    <path d="M 19.6 106.5 A 66 66 0 0 1 106.5 19.6" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <svg className="orb-arc orb-arc-2" viewBox="0 0 160 160" aria-hidden="true">
                    <path d="M 140.4 53.5 A 66 66 0 0 1 53.5 140.4" fill="none" stroke="#a67c3d" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="category-orb-image" style={{ position: 'absolute', inset: '30px', borderRadius: '50%', overflow: 'hidden', display: 'block', background: '#ddd9d1' }}>
                    <img
                      src={image}
                      alt={cat.name}
                      onError={(e) => { e.currentTarget.src = '/assets/images/1.jpg' }}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </span>
                </span>
                <span className="category-orb-label">{cat.name}</span>
              </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED EDITORIAL (SELECTED PIECES) */}
      {featuredPieces.length > 0 && (
        <section className="section featured-editorial-section reveal in-view">
          <div className="container">
            <div className="featured-editorial-heading">
              <div>
                <p className="section-eyebrow">Featured</p>
                <h2 className="section-heading">Selected Pieces</h2>
              </div>
              <span className="featured-counter">
                <strong>{String(featuredIndex + 1).padStart(2, '0')}</strong> / {String(featuredPieces.length).padStart(2, '0')}
              </span>
            </div>

            <div className="featured-editorial" id="featuredCarousel">
              <div className="featured-editorial-image">
                {featuredPieces.map((p, i) => {
                  const img = p.images?.[0]?.url || '/assets/images/1.jpg'
                  return (
                    <div
                      key={p.id}
                      className={`featured-slide-image${i === featuredIndex ? ' is-active' : ''}`}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center center', display: 'block' }} />
                    </div>
                  )
                })}
              </div>

              <div className="featured-editorial-info">
                {activeFeatured && (
                  <div className="featured-slide-info is-active">
                    <p className="featured-piece-number">{String(featuredIndex + 1).padStart(2, '0')}</p>
                    <h3>{activeFeatured.name}</h3>
                    <p className="featured-piece-copy">
                      {activeFeatured.description || 'Precision in every detail. Designed to be worn, noticed, and remembered.'}
                    </p>

                    <div className="featured-piece-bottom">
                      <span className="featured-piece-price">Rs {Number(activeFeatured.price).toLocaleString()}</span>
                      <Link to={`/product/${activeFeatured.slug}`} className="featured-piece-link">
                        View Piece <span>→</span>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="featured-navigation">
                  <button type="button" className="featured-nav-btn" onClick={prevFeatured} aria-label="Previous featured product">
                    ←
                  </button>
                  <span className="featured-nav-line">
                    <i style={{ width: `${((featuredIndex + 1) / featuredPieces.length) * 100}%` }}></i>
                  </span>
                  <button type="button" className="featured-nav-btn" onClick={nextFeatured} aria-label="Next featured product">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: BEST SELLERS (WHAT EVERYONE'S WEARING) */}
      {bestsellers.length > 0 && (
        <section className="section reveal in-view">
          <div className="container" style={{ maxWidth: '900px' }}>
            <p className="section-eyebrow">Best Sellers</p>
            <h2 className="section-heading">What Everyone's Wearing</h2>
            <div className="bestseller-list">
              {bestsellers.map((p, i) => {
                const img = p.images?.[0]?.url || '/assets/images/1.jpg'
                const isAdded = addedId === p.id
                return (
                  <div key={p.id} className="bestseller-row">
                    <span className="bestseller-rank mono">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Link to={`/product/${p.slug}`} className="bestseller-thumb">
                      <img src={img} alt={p.name} loading="lazy" />
                    </Link>
                    <div className="bestseller-info">
                      <Link to={`/product/${p.slug}`}>
                        <h3>{p.name}</h3>
                      </Link>
                      {p.stock > 0 && p.stock <= p.low_stock_threshold && (
                        <p className="low-stock-label">
                          Only {p.stock} left
                        </p>
                      )}
                    </div>
                    <div className="bestseller-price">
                      <span className="mono">
                        Rs {Number(p.price).toLocaleString()}
                      </span>
                    </div>
                    <Link
                      to={`/product/${p.slug}`}
                      className="bestseller-add-btn"
                    >
                      VIEW
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: NEW ARRIVALS CAROUSEL */}
      {newArrivals.length > 0 && (
        <section id="new-arrivals" className="new-arrivals-section reveal in-view">
          <div className="new-arrivals-bg"></div>

          <div className="new-arrivals-panel">
            <div className="container">
              <div className="new-arrivals-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                  New Arrivals
                </h2>
                <Link to="/collection" className="new-arrivals-all" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  All Products <span>→</span>
                </Link>
              </div>

              <div className="new-arrivals-line" style={{ height: '1px', background: '#dcd8cf', marginBottom: '2rem' }}></div>

              <div className="new-arrivals-carousel" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="new-arrivals-arrow new-arrivals-arrow-left"
                  onClick={prevArrivals}
                  aria-label="Previous products"
                >
                  ←
                </button>

                <div
                  style={{ overflow: 'hidden', width: '100%' }}
                >
                  <div
                    className="new-arrivals-track"
                    id="arrivalsCarousel"
                    ref={arrivalsTrackRef}
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                      transform: `translateX(calc(-${arrivalsIndex} * (25% + 0.375rem)))`,
                      paddingBottom: '1rem',
                      willChange: 'transform',
                    }}
                  >
                    {newArrivals.map((p, i) => {
                      const img = p.images?.[0]?.url || '/assets/images/1.jpg'
                      return (
                        <div
                          key={p.id}
                          className="new-arrival-item"
                          style={{ flex: '0 0 calc(25% - 1.15rem)', minWidth: '220px' }}
                        >
                          <Link to={`/product/${p.slug}`} className="new-arrival-image" style={{ display: 'block', aspectRatio: '1', overflow: 'hidden', background: '#eee', marginBottom: '1rem' }}>
                            <img src={img} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Link>

                          <div className="new-arrival-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                              <span className="new-arrival-number mono" style={{ fontSize: '0.75rem', color: 'var(--graphite-soft)' }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <Link to={`/product/${p.slug}`}>
                                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                                  {p.name}
                                </h3>
                              </Link>
                            </div>

                            <span className="new-arrival-price mono" style={{ fontSize: '0.85rem', color: 'var(--graphite)' }}>
                              Rs {Number(p.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="new-arrivals-arrow new-arrivals-arrow-right"
                  onClick={nextArrivals}
                  aria-label="Next products"
                >
                  →
                </button>
              </div>

              <div className="new-arrivals-footer">
                <span className="mono">{String(arrivalsIndex + getArrivalsPerPage()).padStart(2, '0')}</span>
                <span className="new-arrivals-progress">
                  <i style={{ width: `${(Math.min(newArrivals.length, arrivalsIndex + getArrivalsPerPage()) / Math.max(1, newArrivals.length)) * 100}%` }}></i>
                </span>
                <span className="mono">{String(newArrivals.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: BRAND STATEMENT (UPRIGHT IMAGE) */}
      <section className="section section-dark reveal in-view">
        <div className="container brand-statement">
          <div className="brand-statement-image" style={{ overflow: 'hidden', minHeight: '420px' }}>
            <img
              src="/assets/images/brandS.jpeg"
              alt="Model wearing an Eternal Mens watch"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '420px',
                objectFit: 'cover',
                objectPosition: 'center center',
                display: 'block',
              }}
            />
          </div>
          <div>
            <p className="section-eyebrow">Our Philosophy</p>
            <h2>Designed for the modern man.</h2>
            <p>Every piece we make is judged against three things: style that doesn't date, quality that holds up to daily wear, and the kind of detail you only notice up close.</p>
          </div>
        </div>
      </section>

      {/* TRUST GRID */}
      <section className="section reveal in-view">
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

      {/* REVIEWS GRID */}
      <section className="section reveal in-view">
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
      <section className="section section-dark reveal in-view">
        <div className="container newsletter">
          <h2>Join the List</h2>
          <p>New arrivals, early access, and the occasional private discount. No spam.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
