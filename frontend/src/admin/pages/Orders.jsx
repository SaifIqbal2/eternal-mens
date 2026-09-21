import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetOrders, adminDeleteOrder } from '../../lib/api'

const STATUS_COLORS = {
  PENDING: '#c9a96a', CONFIRMED: '#6a9acf', PROCESSING: '#6a9acf',
  SHIPPED: '#7abf8a', DELIVERED: '#3a6b46', CANCELLED: '#a83232', REFUNDED: '#888'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminGetOrders({ status: statusFilter || undefined })
      .then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [statusFilter])

  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone?.includes(search)
  )

  const handleDelete = async (id, orderNum) => {
    if (!confirm(`Delete order ${orderNum}? This cannot be undone.`)) return
    try {
      await adminDeleteOrder(id)
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Orders</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search order/customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text)', padding: '0.6rem 0.75rem', fontSize: '0.85rem', width: '240px' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text)', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
        >
          <option value="">All Statuses</option>
          {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--admin-text-muted)' }}>Loading orders...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border-strong)' }}>
                {['Order #', 'Customer', 'Phone', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.5rem', textAlign: 'left', color: 'var(--admin-text-muted)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '2rem', color: 'var(--admin-text-muted)', textAlign: 'center' }}>No orders found.</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{o.order_number}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontWeight: 500 }}>{o.customer_name}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{o.customer_phone}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Rs {Number(o.total).toLocaleString()}</td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{o.payment_method}</td>
                  <td style={{ padding: '0.7rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', background: (STATUS_COLORS[o.status] || '#888') + '22', color: STATUS_COLORS[o.status] || '#888', border: `1px solid ${STATUS_COLORS[o.status] || '#888'}44`, whiteSpace: 'nowrap' }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('en-PK')}
                  </td>
                  <td style={{ padding: '0.7rem 0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <Link to={`/admin/orders/${o.id}`} style={{ color: 'var(--brass-soft)', fontSize: '0.75rem' }}>View</Link>
                      <button onClick={() => handleDelete(o.id, o.order_number)} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#a83232', cursor: 'pointer', padding: 0 }}>Delete</button>
                    </div>
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
