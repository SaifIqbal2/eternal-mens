import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        <div className="footer-brand">
          <div className="footer-logo-wrapper">
            <span className="footer-logo-monogram">EM</span>
            <span className="footer-logo-line"></span>
            <span className="footer-logo-text">ETERNAL MENS</span>
          </div>
          <p className="footer-brand-desc">Timepieces and accessories built for the<br/>modern man.</p>
        </div>

        <div className="footer-links-grid">
          <nav className="footer-col">
            <h4 className="footer-col-heading">EXPLORE</h4>
            <Link to="/collection?section=watches">Watches</Link>
            <Link to="/collection?section=accessories">Accessories</Link>
            <a href="/#new-arrivals">New Arrivals</a>
            <a href="/#best-sellers">Best Sellers</a>
          </nav>

          <nav className="footer-col">
            <h4 className="footer-col-heading">CUSTOMER</h4>
            <Link to="/order-tracking">Order Tracking</Link>
            <Link to="/returns">Exchange &amp; Returns</Link>
            <Link to="/shipping">Shipping &amp; Deliveries</Link>
            <Link to="/faq">FAQ</Link>
          </nav>

          <nav className="footer-col footer-col-full">
            <h4 className="footer-col-heading">COMPANY</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </nav>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>&copy; Copyrights Reserved by Eternal Mens {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
