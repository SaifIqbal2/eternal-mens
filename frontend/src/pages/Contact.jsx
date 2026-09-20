import React, { useState } from 'react'
import { submitContactMessage } from '../lib/api'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const fd = new FormData(e.target)
    try {
      await submitContactMessage({
        name: fd.get('name'),
        email: fd.get('email'),
        message: fd.get('message'),
      })
      setSent(true)
    } catch {
      setError('Failed to send message. Please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="contact-hero">
        <div className="container">
          <span className="contact-eyebrow">ETERNAL MENS</span>
          <h1>Let's Talk.</h1>
          <p>Have a question about a product, your order, shipping or anything else? We're here to help.</p>
        </div>
      </section>

      <section className="section contact-main">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-information">
              <span className="contact-label">GET IN TOUCH</span>
              <h2>We'd love to<br />hear from you.</h2>
              <p className="contact-description">
                Whether you're looking for more information about a product or need help with an existing order,
                reach out and our team will get back to you as soon as possible.
              </p>

              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eternalmens7@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-info-item">
                <span className="contact-info-icon">@</span>
                <span>
                  <small>EMAIL</small>
                  <strong>eternalmens7@gmail.com</strong>
                </span>
              </a>

              <a href="tel:+923716740179" className="contact-info-item">
                <span className="contact-info-icon">☎</span>
                <span>
                  <small>PHONE</small>
                  <strong>+92 3716740179</strong>
                </span>
              </a>

              <a href="https://wa.me/923716740179" target="_blank" rel="noopener noreferrer" className="contact-info-item">
                <span className="contact-info-icon">W</span>
                <span>
                  <small>WHATSAPP</small>
                  <strong>Chat With Us</strong>
                </span>
              </a>

              <div className="contact-info-item contact-hours">
                <span className="contact-info-icon">◷</span>
                <span>
                  <small>CUSTOMER SUPPORT</small>
                  <strong>Monday — Saturday</strong>
                  <em>12:00 AM — 8:00 PM</em>
                </span>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <span className="contact-label">SEND A MESSAGE</span>
              {sent ? (
                <div style={{ background: '#eaf4ee', border: '1px solid var(--success)', color: 'var(--success)', padding: '1.5rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
                  ✓ Thanks — we've received your message and will get back to you within 1–2 business days.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                  <div className="form-group"><label>Name</label><input type="text" name="name" required /></div>
                  <div className="form-group"><label>Email</label><input type="email" name="email" required /></div>
                  <div className="form-group"><label>Message</label><textarea name="message" rows="5" required></textarea></div>
                  {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
                  <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
