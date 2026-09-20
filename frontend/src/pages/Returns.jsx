import React from 'react'
import { Link } from 'react-router-dom'

export default function Returns() {
  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <p className="section-eyebrow">Policy</p>
        <h1 className="section-heading">Returns &amp; Exchange</h1>
        <div style={{ color: 'var(--graphite)', lineHeight: 1.8 }}>
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>5-Day Returns</h3>
          <p>If you're not satisfied with your purchase, you can return it within 5 days of delivery for a full refund or exchange, provided the item is unused and in its original packaging.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>How to Start a Return</h3>
          <p>Contact us through our <Link to="/contact" style={{ textDecoration: 'underline' }}>Contact page</Link> with your order number and reason for return. We'll send you instructions and a return address.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Refunds</h3>
          <p>Once we receive and inspect your return, refunds are processed within 5–7 business days to your original payment method.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Non-Returnable Items</h3>
          <p>Items marked as final sale, or showing signs of wear beyond inspection, are not eligible for return.</p>
        </div>
      </div>
    </section>
  )
}
