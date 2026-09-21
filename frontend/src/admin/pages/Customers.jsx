import React, { useEffect, useState } from 'react'
import { adminGetCustomers } from '../../lib/api'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    adminGetCustomers().then(setCustomers).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Customers <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--admin-text-muted)' }}>({customers.length})</span>
      </h1>

      <input
        type="text"
        placeholder="Search by name, email or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '1.25rem', width: '100%', maxWidth: '360px', background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text)', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
      />

      {loading ? (
        <p style={{ color: 'var(--admin-text-muted)' }}>Loading customers...</p>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border-strong)' }}>
                {['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--admin-text-muted)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', color: 'var(--admin-text-muted)', textAlign: 'center' }}>No customers found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--admin-border)', cursor: 'pointer' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '0.7rem 0.75rem', color: 'var(--admin-text-muted)' }}>
                    <a href={`mailto:${c.email}`} style={{ color: 'var(--brass-soft)' }} onClick={e => e.stopPropagation()}>{c.email}</a>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{c.phone || '—'}</td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ background: c.total_orders > 0 ? '#dcfce7' : '#f1f5f9', color: c.total_orders > 0 ? '#166534' : 'var(--admin-text-muted)', padding: '0.15rem 0.5rem', fontSize: '0.72rem', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                      {c.total_orders}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 500, color: c.total_spent > 0 ? 'var(--admin-text)' : 'var(--admin-text-muted)' }}>
                    {c.total_spent > 0 ? `Rs ${Number(c.total_spent).toLocaleString()}` : '—'}
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-PK')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
