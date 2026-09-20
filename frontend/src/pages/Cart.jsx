import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCartStore()
  const navigate = useNavigate()

  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0)
  const shippingCost = 0
  const total = subtotal + shippingCost

  return (
    <>
      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <h1 className="section-heading">Your Cart</h1>

          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Your cart is empty.</p>
              <Link to="/collection" className="btn btn-outline-dark" style={{ marginTop: '1.5rem' }}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Cart Lines */}
              <div className="cart-lines">
                {cart.map((item) => (
                  <div className="cart-line" key={`${item.id}-${item.variant_id}`}>
                    <Link to={`/product/${item.slug}`} className="cart-line-image">
                      <img src={item.image || '/assets/images/1.jpg'} alt={item.name} />
                    </Link>
                    <div className="cart-line-info">
                      <Link to={`/product/${item.slug}`}><h3>{item.name}</h3></Link>
                      {item.variant_name && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--graphite-soft)' }}>{item.variant_name}</p>
                      )}
                      <p className="mono" style={{ marginTop: '0.5rem' }}>
                        Rs {Number(item.price).toLocaleString()}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          onChange={e => updateQuantity(item.id, Number(e.target.value))}
                          style={{ width: '70px', border: '1px solid var(--hairline)', padding: '0.4rem' }}
                        />
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--danger)', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mono" style={{ fontWeight: 500 }}>
                      Rs {Number(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
                <Link to="/collection" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  ← Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="cart-summary">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                  Order Summary
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <span className="mono">Rs {Number(subtotal).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <span>Shipping</span>
                  <span className="mono" style={{ color: 'var(--success)' }}>Free</span>
                </div>
                <div style={{ borderTop: '1px solid var(--hairline)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span className="mono">Rs {Number(total).toLocaleString()}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .cart-layout { display:grid; grid-template-columns:1fr; gap:2.5rem; }
        @media (min-width: 900px) { .cart-layout { grid-template-columns: 2fr 1fr; } }
        .cart-line { display:flex; gap:1.25rem; padding:1.5rem 0; border-bottom:1px solid var(--hairline); }
        .cart-line-image { width:90px; height:90px; flex-shrink:0; overflow:hidden; background:var(--hairline); }
        .cart-line-image img { width:100%; height:100%; object-fit:cover; }
        .cart-line-info { flex:1; }
        .cart-summary { border:1px solid var(--hairline); padding:1.75rem; align-self:start; }
      `}</style>
    </>
  )
}
