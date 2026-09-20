import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminGetOrder, adminUpdateOrderStatus } from '../../lib/api'

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']
const STATUS_COLORS = {
  PENDING: '#c9a96a', CONFIRMED: '#6a9acf', PROCESSING: '#6a9acf',
  SHIPPED: '#7abf8a', DELIVERED: '#3a6b46', CANCELLED: '#a83232', REFUNDED: '#888'
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    adminGetOrder(id)
      .then(o => { setOrder(o); setStatus(o.status) })
      .catch(() => navigate('/admin/orders'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async () => {
    setSaving(true)
    try {
      await adminUpdateOrderStatus(id, status)
      setOrder(o => ({ ...o, status }))
      alert('Status updated!')
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ color: 'var(--graphite-soft)' }}>Loading order...</p>
  if (!order) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: '1px solid #2a2a2d', color: 'var(--graphite-soft)', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>
          ← Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
          Order {order.order_number}
        </h1>
        <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: (STATUS_COLORS[order.status] || '#888') + '22', color: STATUS_COLORS[order.status] || '#888', border: `1px solid ${STATUS_COLORS[order.status] || '#888'}44` }}>
          {order.status}
        </span>
      </div>

      <div className="od-grid">
        {/* Customer & Shipping */}
        <div>
          <div style={card}>
            <h3 style={cardTitle}>Customer</h3>
            <p style={infoRow}><strong>Name:</strong> {order.customer_name}</p>
            <p style={infoRow}><strong>Email:</strong> {order.customer_email}</p>
            <p style={infoRow}><strong>Phone:</strong> {order.customer_phone}</p>
          </div>
          <div style={card}>
            <h3 style={cardTitle}>Shipping Address</h3>
            <p style={infoRow}>{order.shipping_line1}</p>
            <p style={infoRow}>{order.shipping_city}{order.shipping_postal ? `, ${order.shipping_postal}` : ''}</p>
            <p style={infoRow}>{order.shipping_country}</p>
          </div>
          <div style={card}>
            <h3 style={cardTitle}>Payment</h3>
            <p style={infoRow}><strong>Method:</strong> {order.payment_method}</p>
            <p style={infoRow}><strong>Status:</strong> {order.payment_status}</p>
            {order.discount_code && <p style={infoRow}><strong>Discount Code:</strong> {order.discount_code}</p>}
          </div>
        </div>

        {/* Right: items + status update */}
        <div>
          <div style={card}>
            <h3 style={cardTitle}>Order Items</h3>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #1e1e20', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                  {item.variant_name && <div style={{ color: 'var(--graphite-soft)', fontSize: '0.75rem' }}>{item.variant_name}</div>}
                  <div style={{ color: 'var(--graphite-soft)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{item.sku} × {item.quantity}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                  Rs {Number(item.line_total).toLocaleString()}
                </div>
              </div>
            ))}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #2a2a2d', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--graphite-soft)' }}>Subtotal</span>
                <span className="mono">Rs {Number(order.subtotal).toLocaleString()}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#3a6b46' }}>
                  <span>Discount</span>
                  <span className="mono">-Rs {Number(order.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--graphite-soft)' }}>Shipping</span>
                <span className="mono">{order.shipping_cost > 0 ? `Rs ${Number(order.shipping_cost).toLocaleString()}` : 'Free'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid #2a2a2d', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Total</span>
                <span className="mono">Rs {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>Update Status</h3>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', background: '#0e0e10', border: '1px solid #2a2a2d', color: 'var(--bone)', padding: '0.6rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving}
              style={{ width: '100%', background: 'var(--brass)', color: 'var(--bone)', border: 'none', padding: '0.7rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>

          <div style={{ ...card, fontSize: '0.78rem', color: 'var(--graphite-soft)' }}>
            <p><strong style={{ color: 'var(--bone)' }}>Placed:</strong> {new Date(order.created_at).toLocaleString('en-PK')}</p>
            <p style={{ marginTop: '0.3rem' }}><strong style={{ color: 'var(--bone)' }}>Updated:</strong> {new Date(order.updated_at).toLocaleString('en-PK')}</p>
          </div>
        </div>
      </div>

      <style>{`
        .od-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 900px) { .od-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  )
}

const card = { background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '1.25rem', marginBottom: '1rem' }
const cardTitle = { fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--graphite-soft)', marginBottom: '0.75rem', fontWeight: 400 }
const infoRow = { fontSize: '0.85rem', marginBottom: '0.35rem', lineHeight: 1.5 }
