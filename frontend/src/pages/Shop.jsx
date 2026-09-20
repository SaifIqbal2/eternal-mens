import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/api'

function ProductCard({ p }) {
  const img = p.images?.[0]?.url || '/assets/images/1.jpg'
  const inStock = p.stock > 0
  return (
    <div className="product-card">
      <div className="product-card-image">
        <Link to={`/product/${p.slug}`} className="product-card-image-link">
          <img src={img} alt={p.name} loading="lazy" />
        </Link>
        {!inStock && <span className="badge">Sold Out</span>}
        {p.compare_at_price && <span className="badge" style={{ background: 'var(--brass)' }}>Sale</span>}
        {p.stock > 0 && p.stock <= p.low_stock_threshold && (
          <span className="badge-stock">Only {p.stock} left</span>
        )}
        {inStock && (
          <Link to={`/product/${p.slug}`} className="quick-add">View Product</Link>
        )}
      </div>
      <div className="product-card-info">
        <div>
          <Link to={`/product/${p.slug}`}><h3>{p.name}</h3></Link>
          {p.stock > 0 && p.stock <= p.low_stock_threshold && (
            <p className="low-stock-label">Low Stock</p>
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

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const section = searchParams.get('section') || 'watches'
  const categorySlug = searchParams.get('category') || ''
  const searchQ = searchParams.get('q') || ''
  const sortParam = searchParams.get('sort') || 'newest'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchQ)

  useEffect(() => {
    getCategories(section).then(setCategories).catch(console.error)
  }, [section])

  useEffect(() => {
    setLoading(true)
    getProducts({ section, categorySlug: categorySlug || null, search: searchQ, sort: sortParam })
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [section, categorySlug, searchQ, sortParam])

  const applyFilters = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const params = { section }
    const q = fd.get('q')?.trim()
    const cat = fd.get('category')
    const sort = fd.get('sort')
    if (q) params.q = q
    if (cat) params.category = cat
    if (sort) params.sort = sort
    setSearchParams(params)
  }

  return (
    <section className="section" style={{ paddingTop: '3rem' }}>
      <div className="container">
        <p className="section-eyebrow">{products.length} Products</p>
        <h1 className="section-heading" style={{ marginBottom: '2rem' }}>
          {section === 'watches' ? 'Watches' : 'Accessories'}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="collection-layout">
          {/* Filters Sidebar */}
          <aside style={{ maxWidth: '260px' }}>
            <form onSubmit={applyFilters}>
              <div className="form-group">
                <label>Search</label>
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQ}
                  placeholder="Search products..."
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" defaultValue={categorySlug}>
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sort By</label>
                <select name="sort" defaultValue={sortParam}>
                  <option value="newest">Newest</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button type="submit" className="btn btn-outline-dark btn-block">Apply Filters</button>
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <Link to={`/collection?section=${section}`} style={{ fontSize: '0.8rem', color: 'var(--graphite-soft)' }}>
                  Clear filters
                </Link>
              </div>
            </form>
          </aside>

          {/* Products Grid */}
          <div>
            {loading ? (
              <p style={{ color: 'var(--graphite-soft)', paddingTop: '2rem' }}>Loading products...</p>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h2>No products found</h2>
                <Link to={`/collection?section=${section}`} className="btn btn-outline-dark" style={{ marginTop: '1rem' }}>
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .collection-layout { grid-template-columns: 260px 1fr !important; }
        }
      `}</style>
    </section>
  )
}
