import React, { useEffect, useState } from 'react'
import { adminGetProducts, adminUpdateStock, adminUpdateVariantStock } from '../../lib/api'

export default function AdminInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    adminGetProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleUpdateProductStock = async (productId, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change)
    if (newStock === currentStock) return
    try {
      await adminUpdateStock(productId, newStock)
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p))
    } catch (e) { alert('Error: ' + e.message) }
  }

  const handleUpdateVariantStock = async (productId, variantId, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change)
    if (newStock === currentStock) return
    try {
      await adminUpdateVariantStock(variantId, newStock)
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p
        return {
          ...p,
          variants: p.variants.map(v => v.id === variantId ? { ...v, stock: newStock } : v)
        }
      }))
    } catch (e) { alert('Error: ' + e.message) }
  }

  // Filter products by search
  const filtered = products.filter(p => {
    const s = search.toLowerCase()
    return p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || (p.variants || []).some(v => v.name.toLowerCase().includes(s) || v.sku?.toLowerCase().includes(s))
  })

  // Flatten for table display
  const inventoryRows = []
  filtered.forEach(p => {
    if (!p.variants || p.variants.length === 0) {
      inventoryRows.push({
        id: `p-${p.id}`,
        productId: p.id,
        variantId: null,
        productName: p.name,
        variantName: 'â€”',
        sku: p.sku || 'â€”',
        stock: p.stock || 0,
      })
    } else {
      p.variants.forEach(v => {
        inventoryRows.push({
          id: `v-${v.id}`,
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          variantName: v.name,
          sku: v.sku || 'â€”',
          stock: v.stock || 0,
        })
      })
    }
  })

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Inventory</h1>

      <div style={{ background: 'var(--admin-bg-sec)', padding: '1.5rem', border: '1px solid var(--admin-border)', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search product, SKU or variant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', outline: 'none' }}
        />
      </div>

      <div style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
          <h2 style={{ fontSize: '1rem' }}>Stock Levels</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>SKU</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Variant</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Current Stock</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '1rem' }}>Loading...</td></tr>
              ) : inventoryRows.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '1rem' }}>No inventory found.</td></tr>
              ) : inventoryRows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{row.productName}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)' }}>{row.sku}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)' }}>{row.variantName}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', background: row.stock > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: row.stock > 0 ? '#4CAF50' : '#F44336' }}>
                      {row.stock}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => row.variantId ? handleUpdateVariantStock(row.productId, row.variantId, row.stock, -1) : handleUpdateProductStock(row.productId, row.stock, -1)}
                        style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)', cursor: 'pointer' }}>-</button>
                      <input 
                        type="number" 
                        value={row.stock} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (row.variantId) handleUpdateVariantStock(row.productId, row.variantId, row.stock, val - row.stock);
                          else handleUpdateProductStock(row.productId, row.stock, val - row.stock);
                        }}
                        style={{ width: '50px', textAlign: 'center', padding: '0.25rem', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }} 
                      />
                      <button 
                        onClick={() => row.variantId ? handleUpdateVariantStock(row.productId, row.variantId, row.stock, 1) : handleUpdateProductStock(row.productId, row.stock, 1)}
                        style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)', cursor: 'pointer' }}>+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
