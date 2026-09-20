import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../lib/api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await adminLogin(email, password)
      navigate('/admin')
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--ink)', fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '2.5rem',
        width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--bone)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          ETERNAL MENS
        </h1>
        <p style={{ color: 'var(--graphite-soft)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
          Admin Panel
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--bone)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', background: '#0e0e10', border: '1px solid #2a2a2d', color: 'var(--bone)', padding: '0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--bone)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', background: '#0e0e10', border: '1px solid #2a2a2d', color: 'var(--bone)', padding: '0.75rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}
            />
          </div>

          {error && (
            <p style={{ color: '#e05050', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'var(--brass)', color: 'var(--bone)', border: 'none', padding: '0.9rem', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
