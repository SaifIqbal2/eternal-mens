import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { adminLogout } from '../lib/api'

const navLinks = [
  { to: '/admin',            label: 'Dashboard',   icon: 'Ã¢â€”Ë†' },
  { to: '/admin/orders',     label: 'Orders',      icon: 'Ã°Å¸â€œÂ¦' },
  { to: '/admin/products',   label: 'Products',    icon: 'Ã¢Å’Å¡' },
  { to: '/admin/inventory',  label: 'Inventory',   icon: 'Ã°Å¸â€œÅ ' },
  { to: '/admin/categories', label: 'Categories',  icon: 'Ã°Å¸â€”â€š' },
  { to: '/admin/discounts',  label: 'Discounts',   icon: 'Ã°Å¸ÂÂ·' },
  { to: '/admin/messages',   label: 'Messages',    icon: 'Ã¢Å“â€°' },
  { to: '/admin/reviews',    label: 'Reviews',     icon: 'Ã¢Ëœâ€¦' },
  { to: '/admin/customers',  label: 'Customers',   icon: 'Ã°Å¸â€˜Â¤' },
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', color: 'var(--admin-text)' }}>
        Loading...
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-sans)', background: 'var(--admin-bg-main)', color: 'var(--admin-text)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#1e293b', borderRight: 'none',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="admin-sidebar">
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--admin-border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--admin-text)' }}>ETERNAL MENS</div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>Admin Panel</div>
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
                  color: active ? '#f8c55b' : 'rgba(241,245,249,0.6)',
                  background: active ? 'rgba(248,197,91,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid #f8c55b' : '2px solid transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--admin-border)' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text-muted)', padding: '0.6rem', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Sign Out
          </button>
          <Link to="/" target="_blank" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--admin-text-muted)', textDecoration: 'underline' }}>
            View Store Ã¢â€ â€™
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '2rem', minHeight: '100vh', background: 'var(--admin-bg-main)' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { width: 200px; transform: translateX(-100%); }
          main { margin-left: 0 !important; }
        }
        .admin-sidebar a:hover { color: #f8c55b !important; }
      `}</style>
    </div>
  )
}

