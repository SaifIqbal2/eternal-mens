import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'

export default function Header() {
  const cart = useCartStore((state) => state.cart)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="container header-inner">

        <Link to="/" className="logo" onClick={closeMenu}>
          <img src="/assets/images/logo.png" alt="Eternal Mens" className="logo-mark" style={{ height: '36px', width: 'auto' }} />
          <span>ETERNAL MENS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="main-nav" id="mainNav">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/collection?section=watches" onClick={closeMenu}>Watches</Link>
          <Link to="/collection?section=accessories" onClick={closeMenu}>Accessories</Link>
          <Link to="/about" onClick={closeMenu}>About Us</Link>
          <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
        </nav>

        {/* Mobile nav dropdown */}
        <nav className={`mobile-nav${menuOpen ? ' open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/collection?section=watches" onClick={closeMenu}>Watches</Link>
          <Link to="/collection?section=accessories" onClick={closeMenu}>Accessories</Link>
          <Link to="/about" onClick={closeMenu}>About Us</Link>
          <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
        </nav>

        <div className="header-icons">
          <Link to="/cart" className="icon-link cart-link" aria-label="Cart" onClick={closeMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="cart-badge" id="cartBadge" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>
              {cartCount}
            </span>
          </Link>
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}
