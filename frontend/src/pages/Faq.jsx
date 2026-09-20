import React from 'react'

export default function Faq() {
  const faqs = [
    { q: 'How long does delivery take?', a: 'Orders typically arrive in 5-7 business days after dispatch. You\'ll get tracking details by email once your order ships.' },
    { q: 'What payment methods do you accept?', a: 'Cash on Delivery and Bank Transfer are available at checkout. Online card payments are coming soon.' },
    { q: 'Can I return or exchange an item?', a: 'Yes — we offer a 14-day return window from the day you receive your order. See our Returns & Exchange page for the full policy.' },
    { q: 'How do I track my order?', a: 'Use the Order Tracking page with your order number and the email you used at checkout.' },
    { q: 'Do you ship internationally?', a: 'Not yet — we currently ship within Pakistan only. International shipping is on our roadmap.' },
  ]

  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <p className="section-eyebrow">Help</p>
        <h1 className="section-heading">Frequently Asked Questions</h1>
        <div>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--hairline)', padding: '1.5rem 0' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>{f.q}</h3>
              <p style={{ color: 'var(--graphite)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
