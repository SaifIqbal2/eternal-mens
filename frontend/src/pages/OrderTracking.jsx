import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    setOrder(null)

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .ilike('customer_email', email.trim())
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setOrder(data)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const currentIndex = order ? STATUSES.indexOf(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED' || order?.status === 'REFUNDED'

  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <p className="section-eyebrow">Track Your Order</p>
        <h1 className="section-heading">Where's My Order?</h1>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Order Number</label>
            <input
              type="text"
              placeholder="e.g. ORD-1001"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Used at Checkout</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {notFound && (
          <p style={{ marginTop: '1.5rem', color: 'var(--danger)' }}>
            We couldn't find an order matching those details. Please check your order number and email.
          </p>
        )}

        {order && (
          <div style={{ marginTop: '2.5rem', border: '1px solid var(--hairline)', padding: '1.75rem' }}>
            <p className="mono" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {order.order_number}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--graphite-soft)', marginBottom: '1.5rem' }}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            {isCancelled ? (
              <p style={{ color: 'var(--danger)', fontWeight: 600 }}>
                {order.status === 'CANCELLED' ? 'This order was cancelled.' : 'This order was refunded.'}
              </p>
            ) : (
              <>
                <div className="tracker">
                  {STATUSES.map((s, i) => (
                    <div key={s} className={`tracker-step${i <= currentIndex ? ' done' : ''}`}>
                      <div className="tracker-dot" />
                      <span>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--hairline)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--graphite)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Total</span>
                    <span className="mono">Rs {Number(order.total).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Payment</span>
                    <span>{order.payment_method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .tracker { display:flex; justify-content:space-between; position:relative; }
        .tracker::before { content:''; position:absolute; top:6px; left:0; right:0; height:1px; background:var(--hairline); }
        .tracker-step { display:flex; flex-direction:column; align-items:center; gap:0.6rem; font-size:0.7rem; color:var(--graphite-soft); position:relative; z-index:1; flex:1; text-align:center; }
        .tracker-dot { width:13px; height:13px; border-radius:50%; background:var(--bone); border:2px solid var(--hairline); }
        .tracker-step.done { color:var(--ink); }
        .tracker-step.done .tracker-dot { background:var(--brass); border-color:var(--brass); }
      `}</style>
    </section>
  )
}
