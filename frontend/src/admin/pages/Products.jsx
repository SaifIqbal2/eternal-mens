import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminGetProducts, adminDeleteProduct } from '../../lib/api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    adminGetProducts().then(setProducts).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await adminDeleteProduct(id)
      load()
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Products</h1>
        <Link to="/admin/products/new" className="admin-btn-primary">+ Add Product</Link>
      </div>

      <input
        type="text"
        placeholder="Search by name or SKU..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '1.25rem', width: '100%', maxWidth: '360px', background: '#1a1a1c', border: '1px solid #2a2a2d', color: 'var(--bone)', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
      />

      {loading ? (
        <p style={{ color: 'var(--graphite-soft)' }}>Loading products...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2d' }}>
                {['Image', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.5rem', textAlign: 'left', color: 'var(--graphite-soft)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '2rem', color: 'var(--graphite-soft)', textAlign: 'center' }}>No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1e1e20' }}>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <div style={{ width: '48px', height: '48px', background: '#2a2a2d', overflow: 'hidden' }}>
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--graphite-soft)' }}>{p.sku}</td>
                  <td style={{ padding: '0.6rem 0.5rem', color: 'var(--graphite-soft)' }}>{p.category?.name}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Rs {Number(p.price).toLocaleString()}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--font-mono)', color: p.stock === 0 ? '#a83232' : p.stock <= p.low_stock_threshold ? '#c9a96a' : 'var(--bone)' }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: p.status === 'ACTIVE' ? '#3a6b4622' : '#88888822', color: p.status === 'ACTIVE' ? '#3a6b46' : '#888', border: `1px solid ${p.status === 'ACTIVE' ? '#3a6b4644' : '#88888844'}` }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/admin/products/${p.id}`} style={{ fontSize: '0.75rem', color: 'var(--brass-soft)' }}>Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.name)} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#a83232', cursor: 'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-btn-primary { background: var(--brass); color: var(--bone); padding: 0.6rem 1.25rem; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; border: none; cursor: pointer; display: inline-block; }
        .admin-btn-primary:hover { background: var(--brass-soft); color: var(--ink) !important; }
      `}</style>
    </div>
  )
}
