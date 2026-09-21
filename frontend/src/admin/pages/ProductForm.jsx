import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminGetProduct, adminSaveProduct, adminGetCategories, adminUploadProductImage, adminDeleteProductImage, adminGetVariants, adminSaveVariant, adminDeleteVariant } from '../../lib/api'

const EMPTY = {
  name: '', slug: '', sku: '', brand: '', category_id: '',
  description: '', materials: '', dimensions: '', weight: '',
  price: '', compare_at_price: '', cost_price: '',
  stock: 0, low_stock_threshold: 5,
  status: 'DRAFT', is_featured: false, is_bestseller: false,
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [productId, setProductId] = useState(null)
  const [variants, setVariants] = useState([])
  const [variantForm, setVariantForm] = useState({ name: '', option_type: 'color', sku: '', price_override: '', stock: 0, is_active: true })
  const [editingVariant, setEditingVariant] = useState(null)

  useEffect(() => {
    adminGetCategories().then(setCategories).catch(console.error)
    if (!isNew) {
      adminGetProduct(id).then(p => {
        const { images: imgs, variants: vars, category, ...rest } = p
        setForm({ ...EMPTY, ...rest })
        setImages(imgs || [])
        setVariants(vars || [])
        setProductId(p.id)
      }).catch(() => setError('Product not found'))
    }
  }, [id])

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => {
      const next = { ...f, [k]: val }
      if (k === 'name' && isNew) next.slug = slugify(val)
      return next
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        category_id: Number(form.category_id),
      }
      if (!isNew) payload.id = productId
      const saved = await adminSaveProduct(payload)
      setProductId(saved.id)
      if (isNew) navigate(`/admin/products/${saved.id}`, { replace: true })
      else alert('Saved!')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    if (!productId) { alert('Save the product first, then upload images.'); return }
    const files = Array.from(e.target.files)
    setUploading(true)
    try {
      for (const file of files) {
        const img = await adminUploadProductImage(productId, file)
        setImages(prev => [...prev, img])
      }
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (img) => {
    if (!confirm('Delete this image?')) return
    try {
      await adminDeleteProductImage(img.id, img.url)
      setImages(prev => prev.filter(i => i.id !== img.id))
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const handleSaveVariant = async (e) => {
    e.preventDefault()
    if (!productId) { alert('Save the product first before adding variants.'); return }
    try {
      const payload = { ...variantForm, product_id: productId, price_override: variantForm.price_override ? Number(variantForm.price_override) : null, stock: Number(variantForm.stock) }
      if (editingVariant) payload.id = editingVariant
      const saved = await adminSaveVariant(payload)
      if (editingVariant) {
        setVariants(prev => prev.map(v => v.id === saved.id ? saved : v))
      } else {
        setVariants(prev => [...prev, saved])
      }
      setVariantForm({ name: '', option_type: 'color', sku: '', price_override: '', stock: 0, is_active: true })
      setEditingVariant(null)
    } catch (e) { alert('Error: ' + e.message) }
  }

  const handleDeleteVariant = async (id) => {
    if (!confirm('Delete this variant?')) return
    try {
      await adminDeleteVariant(id)
      setVariants(prev => prev.filter(v => v.id !== id))
    } catch (e) { alert('Error: ' + e.message) }
  }

  const startEditVariant = (v) => {
    setVariantForm({ name: v.name, option_type: v.option_type || 'color', sku: v.sku || '', price_override: v.price_override || '', stock: v.stock || 0, is_active: v.is_active !== false })
    setEditingVariant(v.id)
  }

  const field = (label, key, type = 'text', props = {}) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={set(key)}
        style={inputStyle}
        {...props}
      />
    </div>
  )

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        {isNew ? 'Add Product' : 'Edit Product'}
      </h1>

      {error && <div style={{ background: '#a8323222', border: '1px solid #a83232', color: '#e05050', padding: '1rem', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSave}>
        <div className="pf-grid">
          {/* Left column */}
          <div>
            <section style={sectionStyle}>
              <h3 style={sectionTitle}>Basic Info</h3>
              {field('Product Name *', 'name')}
              {field('Slug (URL)', 'slug')}
              {field('SKU *', 'sku')}
              {field('Brand', 'brand')}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Category *</label>
                <select value={form.category_id} onChange={set('category_id')} style={inputStyle} required>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={set('status')} style={inputStyle}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--admin-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} />
                  Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--admin-text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_bestseller} onChange={set('is_bestseller')} />
                  Bestseller
                </label>
              </div>
            </section>

            <section style={sectionStyle}>
              <h3 style={sectionTitle}>Description</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Description *</label>
                <textarea value={form.description} onChange={set('description')} rows={5} style={inputStyle} required />
              </div>
              {field('Materials', 'materials')}
              {field('Dimensions', 'dimensions')}
              {field('Weight', 'weight')}
            </section>
          </div>

          {/* Right column */}
          <div>
            <section style={sectionStyle}>
              <h3 style={sectionTitle}>Pricing</h3>
              {field('Price (Rs) *', 'price', 'number', { min: 0, step: '0.01' })}
              {field('Compare At Price (Rs)', 'compare_at_price', 'number', { min: 0, step: '0.01' })}
              {field('Cost Price (Rs)', 'cost_price', 'number', { min: 0, step: '0.01' })}
            </section>

            <section style={sectionStyle}>
              <h3 style={sectionTitle}>Inventory</h3>
              {field('Stock Quantity', 'stock', 'number', { min: 0 })}
              {field('Low Stock Threshold', 'low_stock_threshold', 'number', { min: 0 })}
            </section>

            {/* Images */}
            <section style={sectionStyle}>
              <h3 style={sectionTitle}>Images</h3>
              {!isNew && !productId && (
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  Save the product first to upload images.
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {images.map(img => (
                  <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={img.url} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      style={{ position: 'absolute', top: '2px', right: '2px', background: '#a83232', color: '#fff', border: 'none', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', lineHeight: 1 }}
                    >Ã—</button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || !productId}
                style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}
              />
              {uploading && <p style={{ color: 'var(--brass-soft)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Uploading...</p>}
            </section>

            {/* Variants */}
            {!isNew && (
              <section style={sectionStyle}>
                <h3 style={sectionTitle}>Variants (Color / Size / etc.)</h3>

                {/* Existing variants table */}
                {variants.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--admin-border-strong)' }}>
                          {['Name', 'Type', 'SKU', 'Price Override', 'Stock', 'Active', ''].map(h => (
                            <th key={h} style={{ padding: '0.4rem 0.5rem', textAlign: 'left', color: 'var(--admin-text-muted)', fontWeight: 400, fontSize: '0.65rem', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map(v => (
                          <tr key={v.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                            <td style={{ padding: '0.4rem 0.5rem' }}>{v.name}</td>
                            <td style={{ padding: '0.4rem 0.5rem', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>{v.option_type}</td>
                            <td style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{v.sku}</td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>{v.price_override ? `Rs ${Number(v.price_override).toLocaleString()}` : 'â€”'}</td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>{v.stock}</td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>{v.is_active ? 'âœ“' : 'âœ—'}</td>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="button" onClick={() => startEditVariant(v)} style={{ background: 'none', border: 'none', color: 'var(--brass-soft)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Edit</button>
                                <button type="button" onClick={() => handleDeleteVariant(v.id)} style={{ background: 'none', border: 'none', color: '#a83232', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Del</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add/Edit variant form */}
                <form onSubmit={handleSaveVariant} style={{ background: 'var(--admin-bg)', padding: '1rem', border: '1px solid var(--admin-border-strong)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--brass-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Variant Name *</label>
                      <input required value={variantForm.name} onChange={e => setVariantForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Black, Large" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Option Type</label>
                      <select value={variantForm.option_type} onChange={e => setVariantForm(f => ({ ...f, option_type: e.target.value }))} style={inputStyle}>
                        <option value="color">Color</option>
                        <option value="size">Size</option>
                        <option value="material">Material</option>
                        <option value="style">Style</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>SKU</label>
                      <input value={variantForm.sku} onChange={e => setVariantForm(f => ({ ...f, sku: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Price Override (Rs)</label>
                      <input type="number" min="0" value={variantForm.price_override} onChange={e => setVariantForm(f => ({ ...f, price_override: e.target.value }))} style={inputStyle} placeholder="Leave blank to use product price" />
                    </div>
                    <div>
                      <label style={labelStyle}>Stock</label>
                      <input type="number" min="0" value={variantForm.stock} onChange={e => setVariantForm(f => ({ ...f, stock: e.target.value }))} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--admin-text)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={variantForm.is_active} onChange={e => setVariantForm(f => ({ ...f, is_active: e.target.checked }))} />
                        Active
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" style={{ background: 'var(--brass)', color: 'var(--admin-text)', border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
                      {editingVariant ? 'Update Variant' : 'Add Variant'}
                    </button>
                    {editingVariant && (
                      <button type="button" onClick={() => { setEditingVariant(null); setVariantForm({ name: '', option_type: 'color', sku: '', price_override: '', stock: 0, is_active: true }) }} style={{ background: 'none', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text-muted)', padding: '0.5rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={saving} style={{ background: 'var(--brass)', color: 'var(--admin-text)', border: 'none', padding: '0.75rem 2rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {saving ? 'Saving...' : (isNew ? 'Create Product' : 'Save Changes')}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} style={{ background: 'none', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text-muted)', padding: '0.75rem 1.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>

      <style>{`
        .pf-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 900px) { .pf-grid { grid-template-columns: 1fr 1fr; } }
        textarea { resize: vertical; }
      `}</style>
    </div>
  )
}

const sectionStyle = { background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', padding: '1.25rem', marginBottom: '1.5rem' }
const sectionTitle = { fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '1rem', fontWeight: 400 }
const labelStyle = { display: 'block', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '0.35rem' }
const inputStyle = { width: '100%', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text)', padding: '0.6rem 0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }
