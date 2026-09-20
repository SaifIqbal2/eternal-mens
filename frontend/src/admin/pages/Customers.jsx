import React, { useEffect, useState } from 'react'
import { adminGetCustomers } from '../../lib/api'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
        Customers <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--graphite-soft)' }}>({customers.length})</span>
      </h1>

      <input
        type="text"
        placeholder="Search by name, email or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '1.25rem', width: '100%', maxWidth: '360px', background: '#1a1a1c', border: '1px solid #2a2a2d', color: 'var(--bone)', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
      />

      {loading ? (
        <p style={{ color: 'var(--graphite-soft)' }}>Loading customers...</p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#1a1a1c', border: '1px solid #2a2a2d' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2d' }}>
                {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--graphite-soft)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', color: 'var(--graphite-soft)', textAlign: 'center' }}>No customers found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #1e1e20' }}>
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '0.7rem 0.75rem', color: 'var(--graphite-soft)' }}>
                    <a href={`mailto:${c.email}`} style={{ color: 'var(--brass-soft)' }}>{c.email}</a>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--graphite-soft)' }}>{c.phone || '—'}</td>
                  <td style={{ padding: '0.7rem 0.75rem', fontSize: '0.75rem', color: 'var(--graphite-soft)' }}>
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
