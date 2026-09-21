import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        <div className="footer-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 700, color: 'var(--brass)', textDecoration: 'none', marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>
            <span style={{ 
              display: 'inline-block',
              width: '60px',
              height: '40px',
              backgroundColor: 'currentColor',
              WebkitMaskImage: 'url(/assets/images/logo.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: 'url(/assets/images/logo.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              flexShrink: 0
            }} />
            <span>ETERNAL MENS</span>
          </Link>
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
