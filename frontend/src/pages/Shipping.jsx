import React from 'react'
import { Link } from 'react-router-dom'

export default function Shipping() {
  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <p className="section-eyebrow">Policy</p>
        <h1 className="section-heading">Shipping &amp; Delivery</h1>
        <div style={{ color: 'var(--graphite)', lineHeight: '1.8' }}>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Delivery Times</h3>
          <p>Orders are dispatched within 24–48 hours of confirmation. Once shipped, delivery within Pakistan takes 5–7 business days depending on your city.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Shipping Cost</h3>
          <p>Free Delivery.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Order Tracking</h3>
          <p>Once your order ships, you can check its status anytime on our <Link to="/order-tracking" style={{ textDecoration: 'underline' }}>Order Tracking</Link> page using your order number and email.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Delays</h3>
          <p>Occasionally weather or courier delays push delivery a day or two past the estimate. If your order is significantly delayed, <Link to="/contact" style={{ textDecoration: 'underline' }}>contact us</Link> and we'll look into it right away.</p>
        </div>
      </div>
    </section>
  )
}
