import React from 'react'

export default function Terms() {
  const updated = new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <p className="section-eyebrow">Legal</p>
        <h1 className="section-heading">Terms &amp; Conditions</h1>
        <div style={{ color: 'var(--graphite)', lineHeight: 1.8 }}>
          <p>Last updated: {updated}</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Orders</h3>
          <p>By placing an order, you confirm the details provided are accurate. We reserve the right to cancel any order due to stock issues, pricing errors, or suspected fraud — in which case you'll be notified and fully refunded if payment was already made.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Pricing</h3>
          <p>All prices are listed in Pakistani Rupees (PKR). We reserve the right to change prices at any time without notice.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Product Descriptions</h3>
          <p>We aim for accuracy in all product descriptions and images, but slight variations in color or finish may occur due to display settings or manufacturing.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Limitation of Liability</h3>
          <p>Eternal Mens is not liable for indirect or incidental damages arising from the use of our products beyond the value of the product purchased.</p>
        </div>
      </div>
    </section>
  )
}
