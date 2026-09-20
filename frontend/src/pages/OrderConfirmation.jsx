import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <section className="section" style={{ paddingTop: '4rem' }}>
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✓</div>
        <p className="section-eyebrow">Order Placed</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Thank You!
        </h1>
        {order && (
          <>
            <p style={{ color: 'var(--graphite)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Your order <strong className="mono">{order.order_number}</strong> has been received.
            </p>
            <p style={{ color: 'var(--graphite)', lineHeight: 1.7, marginBottom: '2rem' }}>
              {order.payment_method === 'BANK_TRANSFER'
                ? 'Please transfer your payment to our bank account. Details will be shared via WhatsApp or email shortly.'
                : 'Our team will confirm your order and arrange delivery. We\'ll be in touch soon!'}
            </p>
          </>
        )}
        {!order && (
          <p style={{ color: 'var(--graphite)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Your order has been placed. Our team will contact you shortly to confirm.
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/collection" className="btn btn-primary">Continue Shopping</Link>
          <a href="https://wa.me/923716740179" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark">
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  )
}
