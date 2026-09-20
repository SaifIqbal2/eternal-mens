import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { placeOrder, validateDiscount } from '../lib/api'

export default function Checkout() {
  const { cart, clearCart } = useCartStore()
  const navigate = useNavigate()

  const [discountCode, setDiscountCode] = useState('')
  const [discountData, setDiscountData] = useState(null)
  const [discountMsg, setDiscountMsg] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0)
  const shippingCost = 0
  const total = subtotal - discountAmount + shippingCost

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    try {
      const result = await validateDiscount(discountCode, subtotal)
      if (result.valid) {
        setDiscountData(result.discount)
        setDiscountAmount(result.amount)
        setDiscountMsg(`Discount applied! -Rs ${Number(result.amount).toLocaleString()}`)
      } else {
        setDiscountAmount(0)
        setDiscountData(null)
        setDiscountMsg(result.message)
      }
    } catch {
      setDiscountMsg('Could not validate code. Try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) { setError('Your cart is empty.'); return }

    setSubmitting(true)
    setError('')
    const fd = new FormData(e.target)

    try {
      const order = await placeOrder({
        cart,
        form: {
          name:           fd.get('name'),
          email:          fd.get('email'),
          phone:          fd.get('phone'),
          address:        fd.get('address'),
          city:           fd.get('city'),
          postal:         fd.get('postal'),
          country:        fd.get('country') || 'Pakistan',
          payment_method: fd.get('payment_method'),
        },
        discountCode: discountCode || '',
        discountAmount,
      })
      const itemsSnapshot = cart.map(item => ({
        product_name: item.name,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
      }))
      clearCart()
      navigate('/order-confirmation', { state: { order, items: itemsSnapshot } })
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        <h1 className="section-heading">Checkout</h1>

        {cart.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty. <a href="/collection" style={{ textDecoration: 'underline' }}>Shop now</a></p>
          </div>
        ) : (
          <div className="cart-layout">
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              {/* Shipping Info */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                  Contact &amp; Shipping
                </h3>
                <div className="form-group"><label>Full Name</label><input type="text" name="name" required /></div>
                <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" required placeholder="+92 300 0000000" /></div>
                <div className="form-group"><label>Email</label><input type="email" name="email" required /></div>
                <div className="form-group"><label>Address</label><input type="text" name="address" required /></div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}><label>City</label><input type="text" name="city" required /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Postal Code</label><input type="text" name="postal" /></div>
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" defaultValue="Pakistan" required />
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '2rem 0 1.25rem' }}>
                  Payment Method
                </h3>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input type="radio" name="payment_method" value="COD" id="cod" style={{ width: 'auto' }} defaultChecked />
                  <label htmlFor="cod" style={{ margin: 0 }}>Cash on Delivery</label>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input type="radio" name="payment_method" value="BANK_TRANSFER" id="bank" style={{ width: 'auto' }} />
                  <label htmlFor="bank" style={{ margin: 0 }}>Bank Transfer (payment details sent after order)</label>
                </div>

                {error && (
                  <div style={{ background: '#fde8e8', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', marginTop: '1rem' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: '1.5rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>

              {/* Order Summary */}
              <div className="cart-summary">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                  Order Summary
                </h3>

                {cart.map((item) => (
                  <div key={`${item.id}-${item.variant_id}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--graphite)' }}>
                    <span>{item.name} {item.variant_name ? `(${item.variant_name})` : ''} × {item.quantity}</span>
                    <span className="mono">Rs {Number(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                {/* Discount code */}
                <div style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0' }}>
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    style={{ flex: 1, border: '1px solid var(--hairline)', padding: '0.6rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    style={{ padding: '0.6rem 1rem', fontSize: '0.7rem' }}
                    onClick={handleApplyDiscount}
                  >
                    Apply
                  </button>
                </div>
                {discountMsg && (
                  <p style={{ fontSize: '0.8rem', color: discountAmount > 0 ? 'var(--success)' : 'var(--danger)', marginBottom: '0.75rem' }}>
                    {discountMsg}
                  </p>
                )}

                {/* Totals */}
                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span>Subtotal</span><span className="mono">Rs {Number(subtotal).toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--success)' }}>
                      <span>Discount</span><span className="mono">-Rs {Number(discountAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span>Shipping</span><span className="mono" style={{ color: 'var(--success)' }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--hairline)', paddingTop: '0.75rem', fontSize: '1.1rem' }}>
                    <span>Total</span><span className="mono">Rs {Number(total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .cart-layout { display:grid; grid-template-columns:1fr; gap:2.5rem; }
        @media (min-width: 900px) { .cart-layout { grid-template-columns: 2fr 1fr; } }
        .cart-summary { border:1px solid var(--hairline); padding:1.75rem; align-self:start; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.4rem; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; border: 1px solid var(--hairline); padding: 0.75rem; font-family: var(--font-sans); font-size: 0.9rem; background: transparent; }
      `}</style>
    </section>
  )
}
