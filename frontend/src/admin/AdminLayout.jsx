import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { adminLogout } from '../lib/api'

const navLinks = [
  { to: '/admin',            label: 'Dashboard',   icon: '◈' },
  { to: '/admin/orders',     label: 'Orders',      icon: '📦' },
  { to: '/admin/products',   label: 'Products',    icon: '⌚' },
  { to: '/admin/categories', label: 'Categories',  icon: '🗂' },
  { to: '/admin/discounts',  label: 'Discounts',   icon: '🏷' },
  { to: '/admin/messages',   label: 'Messages',    icon: '✉' },
  { to: '/admin/customers',  label: 'Customers',   icon: '👤' },
]

export default function AdminLayout() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await adminLogout()
    navigate('/admin/login')
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', color: 'var(--bone)' }}>
        Loading...
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-sans)', background: '#111113', color: 'var(--bone)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#0e0e10', borderRight: '1px solid #1e1e20',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="admin-sidebar">
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1e1e20' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--bone)' }}>ETERNAL MENS</div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--graphite-soft)', textTransform: 'uppercase', marginTop: '0.2rem' }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {navLinks.map(link => {
            const active = link.to === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1.25rem', fontSize: '0.82rem',
                  color: active ? 'var(--brass-soft)' : 'var(--graphite-soft)',
                  background: active ? 'rgba(166,124,61,0.1)' : 'transparent',
                  borderLeft: active ? '2px solid var(--brass)' : '2px solid transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1e1e20' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: '1px solid #2a2a2d', color: 'var(--graphite-soft)', padding: '0.6rem', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Sign Out
          </button>
          <Link to="/" target="_blank" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--graphite-soft)', textDecoration: 'underline' }}>
            View Store →
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '2rem', minHeight: '100vh' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { width: 200px; transform: translateX(-100%); }
          main { margin-left: 0 !important; }
        }
        a:hover { color: var(--brass-soft) !important; }
      `}</style>
    </div>
  )
}
