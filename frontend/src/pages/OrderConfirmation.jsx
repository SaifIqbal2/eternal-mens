import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <section className="section text-center" style={{ paddingTop: '4rem' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✓</div>
        <p className="section-eyebrow">Thank You</p>
        <h1 className="section-heading">Order Confirmed</h1>

        {order ? (
          <>
            <p style={{ color: 'var(--graphite)', lineHeight: 1.7 }}>
              Your order <strong className="mono">{order.order_number}</strong> has been placed successfully.
              Please keep your order number for future reference.
            </p>

            {/* Order Items List */}
            <div style={{ textAlign: 'left', border: '1px solid var(--hairline)', padding: '1.75rem', marginTop: '2.5rem' }}>
              {/* If items are passed via state */}
              {state?.items?.length > 0 && state.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  <span>
                    {item.name || item.product_name}
                    {(item.variant_name) ? ` (${item.variant_name})` : ''} × {item.quantity}
                  </span>
                  <span className="mono">
                    Rs {Number(item.line_total || (item.price * item.quantity)).toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Totals breakdown */}
              <div style={{ borderTop: '1px solid var(--hairline)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                {order.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
                    <span>Discount</span>
                    <span className="mono">-Rs {Number(order.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 600 }}>
                  <span>Total</span>
                  <span className="mono">Rs {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--graphite-soft)', lineHeight: 1.6 }}>
              Payment method: {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}<br />
              {order.payment_method === 'BANK_TRANSFER'
                ? 'Please transfer your payment. Details will be shared via WhatsApp or email shortly.'
                : 'Our team will confirm your order and arrange delivery. We\'ll be in touch soon!'}
            </p>

            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--graphite-soft)' }}>
              You can track your order anytime using your order number and email on our{' '}
              <Link to="/order-tracking" style={{ textDecoration: 'underline' }}>Order Tracking</Link> page.
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--graphite)', lineHeight: 1.7 }}>
            Your order has been placed. Our team will contact you shortly to confirm.
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/collection" className="btn btn-outline-dark">Continue Shopping</Link>
          <a href="https://wa.me/923716740179" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  )
}
