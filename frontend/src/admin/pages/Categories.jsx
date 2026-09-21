import React, { useEffect, useState } from 'react'
import { adminGetCategories, adminSaveCategory, adminDeleteCategory, adminUploadCategoryImage } from '../../lib/api'

const EMPTY = { name: '', slug: '', section: 'watches', is_active: true, sort_order: 0, description: '', image_url: '' }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    adminGetCategories().then(setCategories).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => {
      const next = { ...f, [k]: val }
      if (k === 'name' && !editing) next.slug = slugify(val)
      return next
    })
  }

  const startEdit = (c) => {
    setEditing(c.id)
    setForm({ name: c.name, slug: c.slug, section: c.section, is_active: c.is_active, sort_order: c.sort_order, description: c.description || '', image_url: c.image_url || '' })
    setImageFile(null)
    setError('')
  }

  const cancelEdit = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let savedCat = await adminSaveCategory(editing ? { ...form, id: editing } : form)
      
      if (imageFile) {
        const url = await adminUploadCategoryImage(savedCat.id, imageFile)
        await adminSaveCategory({ id: savedCat.id, image_url: url })
      }
      
      cancelEdit()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try { await adminDeleteCategory(id); load() }
    catch (e) { alert('Error: ' + e.message) }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Categories</h1>

      <div className="cat-grid">
        {/* Form */}
        <div style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '1.25rem', fontWeight: 400 }}>
            {editing ? 'Edit Category' : 'Add Category'}
          </h3>
          {error && <p style={{ color: '#e05050', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
          <form onSubmit={handleSave}>
            {[['Name *', 'name'], ['Slug', 'slug'], ['Description', 'description']].map(([label, key]) => (
              <div key={key} style={{ marginBottom: '0.9rem' }}>
                <label style={labelStyle}>{label}</label>
                <input type="text" value={form[key]} onChange={set(key)} style={inputStyle} required={key === 'name'} />
              </div>
            ))}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={labelStyle}>Section</label>
              <select value={form.section} onChange={set('section')} style={inputStyle}>
                <option value="watches">Watches</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={labelStyle}>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={set('sort_order')} style={inputStyle} min="0" />
            </div>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Category Image</label>
              {form.image_url && !imageFile && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <img src={form.image_url} alt="Current" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                </div>
              )}
              {imageFile && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', opacity: 0.7 }} />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImageFile(e.target.files[0] || null)}
                style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }} 
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--admin-text)', marginBottom: '1.25rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
              Active (visible on store)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} style={{ background: 'var(--brass)', color: 'var(--admin-text)', border: 'none', padding: '0.6rem 1.25rem', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {saving ? 'Saving...' : (editing ? 'Update' : 'Add Category')}
              </button>
              {editing && (
                <button type="button" onClick={cancelEdit} style={{ background: 'none', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text-muted)', padding: '0.6rem 1rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div>
          {loading ? <p style={{ color: 'var(--admin-text-muted)' }}>Loading...</p> : (
            <div style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border-strong)' }}>
                    {['Image', 'Name', 'Slug', 'Section', 'Order', 'Active', ''].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--admin-text-muted)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        {c.image_url ? 
                          <img src={c.image_url} alt={c.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> 
                          : <div style={{ width: '40px', height: '40px', background: 'var(--admin-border-strong)', borderRadius: '4px' }} />
                        }
                      </td>
                      <td style={{ padding: '0.7rem 0.75rem', fontWeight: 500 }}>{c.name}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{c.slug}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: 'var(--admin-text-muted)' }}>{c.section}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{c.sort_order}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: c.is_active ? '#3a6b46' : '#a83232' }}>{c.is_active ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '0.7rem 0.75rem' }}>
                        <button onClick={() => startEdit(c)} style={{ background: 'none', border: 'none', color: 'var(--brass-soft)', fontSize: '0.75rem', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                        <button onClick={() => handleDelete(c.id, c.name)} style={{ background: 'none', border: 'none', color: '#a83232', fontSize: '0.75rem', cursor: 'pointer' }}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cat-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 900px) { .cat-grid { grid-template-columns: 320px 1fr; } }
      `}</style>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }
const inputStyle = { width: '100%', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text)', padding: '0.55rem 0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }
