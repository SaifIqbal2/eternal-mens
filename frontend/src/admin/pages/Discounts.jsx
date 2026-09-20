import React, { useEffect, useState } from 'react'
import { adminGetDiscounts, adminSaveDiscount, adminDeleteDiscount } from '../../lib/api'

const EMPTY = { code: '', type: 'PERCENTAGE', value: '', min_order_amount: '', usage_limit: '', starts_at: '', expires_at: '', is_active: true }

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    adminGetDiscounts().then(setDiscounts).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const startEdit = (d) => {
    setEditing(d.id)
    setForm({ code: d.code, type: d.type, value: d.value, min_order_amount: d.min_order_amount || '', usage_limit: d.usage_limit || '', starts_at: d.starts_at?.slice(0, 16) || '', expires_at: d.expires_at?.slice(0, 16) || '', is_active: d.is_active })
    setError('')
  }

  const cancelEdit = () => { setEditing(null); setForm(EMPTY); setError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        value: Number(form.value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
      }
      if (editing) payload.id = editing
      await adminSaveDiscount(payload)
      cancelEdit()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete discount "${code}"?`)) return
    try { await adminDeleteDiscount(id); load() }
    catch (e) { alert('Error: ' + e.message) }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Discount Codes</h1>

      <div className="disc-grid">
        {/* Form */}
        <div style={{ background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={secTitle}>{editing ? 'Edit Discount' : 'Add Discount'}</h3>
          {error && <p style={{ color: '#e05050', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
          <form onSubmit={handleSave}>
            <div style={fg}><label style={lbl}>Code *</label><input type="text" value={form.code} onChange={set('code')} style={inp} required placeholder="SUMMER20" /></div>
            <div style={fg}>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={set('type')} style={inp}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (Rs)</option>
              </select>
            </div>
            <div style={fg}><label style={lbl}>Value *</label><input type="number" value={form.value} onChange={set('value')} style={inp} required min="0" step="0.01" placeholder={form.type === 'PERCENTAGE' ? '10 (= 10%)' : '500 (= Rs 500)'} /></div>
            <div style={fg}><label style={lbl}>Min Order (Rs)</label><input type="number" value={form.min_order_amount} onChange={set('min_order_amount')} style={inp} min="0" /></div>
            <div style={fg}><label style={lbl}>Usage Limit</label><input type="number" value={form.usage_limit} onChange={set('usage_limit')} style={inp} min="1" placeholder="Unlimited" /></div>
            <div style={fg}><label style={lbl}>Starts At</label><input type="datetime-local" value={form.starts_at} onChange={set('starts_at')} style={inp} /></div>
            <div style={fg}><label style={lbl}>Expires At</label><input type="datetime-local" value={form.expires_at} onChange={set('expires_at')} style={inp} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--bone)', marginBottom: '1.25rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
              Active
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} style={{ background: 'var(--brass)', color: 'var(--bone)', border: 'none', padding: '0.6rem 1.25rem', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
              {editing && <button type="button" onClick={cancelEdit} style={{ background: 'none', border: '1px solid #2a2a2d', color: 'var(--graphite-soft)', padding: '0.6rem 1rem', fontSize: '0.78rem', cursor: 'pointer' }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div>
          {loading ? <p style={{ color: 'var(--graphite-soft)' }}>Loading...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', background: '#1a1a1c', border: '1px solid #2a2a2d' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a2d' }}>
                    {['Code', 'Type', 'Value', 'Used', 'Active', 'Expires', ''].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--graphite-soft)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {discounts.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '2rem', color: 'var(--graphite-soft)', textAlign: 'center' }}>No discounts yet.</td></tr>
                  ) : discounts.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #1e1e20' }}>
                      <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.code}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: 'var(--graphite-soft)', fontSize: '0.75rem' }}>{d.type}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{d.type === 'PERCENTAGE' ? `${d.value}%` : `Rs ${d.value}`}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--graphite-soft)' }}>{d.times_used}{d.usage_limit ? `/${d.usage_limit}` : ''}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: d.is_active ? '#3a6b46' : '#a83232' }}>{d.is_active ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.75rem', color: 'var(--graphite-soft)' }}>{d.expires_at ? new Date(d.expires_at).toLocaleDateString('en-PK') : '—'}</td>
                      <td style={{ padding: '0.7rem 0.75rem' }}>
                        <button onClick={() => startEdit(d)} style={{ background: 'none', border: 'none', color: 'var(--brass-soft)', fontSize: '0.75rem', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                        <button onClick={() => handleDelete(d.id, d.code)} style={{ background: 'none', border: 'none', color: '#a83232', fontSize: '0.75rem', cursor: 'pointer' }}>Del</button>
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
        .disc-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 900px) { .disc-grid { grid-template-columns: 320px 1fr; } }
      `}</style>
    </div>
  )
}

const secTitle = { fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--graphite-soft)', marginBottom: '1.25rem', fontWeight: 400 }
const fg = { marginBottom: '0.9rem' }
const lbl = { display: 'block', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--graphite-soft)', marginBottom: '0.3rem' }
const inp = { width: '100%', background: '#0e0e10', border: '1px solid #2a2a2d', color: 'var(--bone)', padding: '0.55rem 0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }
