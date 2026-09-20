import React from 'react'

export default function Privacy() {
  const updated = new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <p className="section-eyebrow">Legal</p>
        <h1 className="section-heading">Privacy Policy</h1>
        <div style={{ color: 'var(--graphite)', lineHeight: 1.8 }}>
          <p>Last updated: {updated}</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Information We Collect</h3>
          <p>When you place an order, we collect your name, email, phone number, and shipping address to process and deliver your order. When you subscribe to our newsletter, we collect your email address.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>How We Use Your Information</h3>
          <p>We use your information solely to process orders, provide customer support. We do not sell your information to third parties.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Data Security</h3>
          <p>Your information is stored securely and access is limited to what's needed to fulfill your order.</p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Your Rights</h3>
          <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
        </div>
      </div>
    </section>
  )
}
