import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetStats, adminGetOrders, adminGetProducts } from '../../lib/api'

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '1.25rem' }}>
      <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--graphite-soft)', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', color: color || 'var(--bone)' }}>{value}</div>
    </div>
  )
}

const STATUS_COLORS = {
  PENDING: '#c9a96a', CONFIRMED: '#6a9acf', PROCESSING: '#6a9acf',
  SHIPPED: '#7abf8a', DELIVERED: '#3a6b46', CANCELLED: '#a83232', REFUNDED: '#888'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminGetStats(),
      adminGetOrders({ limit: 8 }),
      adminGetProducts(),
    ]).then(([s, orders, products]) => {
      setStats(s)
      setRecentOrders(orders.slice(0, 8))
      setLowStock(products.filter(p => p.stock <= p.low_stock_threshold).slice(0, 8))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'var(--graphite-soft)' }}>Loading dashboard...</p>

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.75rem' }}>Dashboard</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Today's Sales" value={`Rs ${Number(stats.todaySales).toLocaleString()}`} />
        <StatCard label="Total Sales" value={`Rs ${Number(stats.totalSales).toLocaleString()}`} />
        <StatCard label="Today's Orders" value={stats.todayOrders} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} color="#c9a96a" />
        <StatCard label="In Stock" value={stats.productsInStock} />
        <StatCard label="Low Stock" value={stats.lowStock} color="#c9a96a" />
        <StatCard label="Out of Stock" value={stats.outOfStock} color="#a83232" />
        <StatCard label="Customers" value={stats.totalCustomers} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="dash-panels">
        {/* Recent Orders */}
        <div style={{ background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--brass-soft)', textDecoration: 'underline' }}>View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--graphite-soft)', fontSize: '0.85rem' }}>No orders yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a2d' }}>
                    {['Order', 'Customer', 'Total', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.5rem', textAlign: 'left', color: 'var(--graphite-soft)', fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #1e1e20' }}>
                      <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{o.order_number}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>{o.customer_name}</td>
                      <td style={{ padding: '0.7rem 0.5rem', fontFamily: 'var(--font-mono)' }}>Rs {Number(o.total).toLocaleString()}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}44` }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <Link to={`/admin/orders/${o.id}`} style={{ color: 'var(--brass-soft)', fontSize: '0.75rem' }}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div style={{ background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>Low Stock Alerts</h2>
            <Link to="/admin/products" style={{ fontSize: '0.75rem', color: 'var(--brass-soft)', textDecoration: 'underline' }}>Manage</Link>
          </div>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--graphite-soft)', fontSize: '0.85rem' }}>All stocked up! ✓</p>
          ) : (
            lowStock.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #1e1e20' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--graphite-soft)', fontFamily: 'var(--font-mono)' }}>{p.sku}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: p.stock === 0 ? '#a83232' : '#c9a96a', fontFamily: 'var(--font-mono)' }}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .dash-panels { grid-template-columns: 1.5fr 1fr !important; } }
      `}</style>
    </div>
  )
}
