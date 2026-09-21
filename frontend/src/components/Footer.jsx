import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        <div className="footer-brand">
          <span className="footer-wordmark">ETERNAL MENS</span>
          <p>Timepieces and accessories built for the modern man.</p>
        </div>

        <nav className="footer-col">
          <Link to="/collection?section=watches">Watches</Link>
          <Link to="/collection?section=accessories">Accessories</Link>
          <Link to="/collection?sort=newest">New Arrivals</Link>
          <Link to="/order-tracking">Order Tracking</Link>
          <Link to="/returns">Exchange &amp; Returns</Link>
          <Link to="/shipping">Shipping &amp; Deliveries</Link>
        </nav>

        <nav className="footer-col">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </nav>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>&copy; Copyrights Reserved by Eternal Mens {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
