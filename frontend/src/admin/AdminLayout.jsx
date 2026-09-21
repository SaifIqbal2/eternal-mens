import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { adminLogout } from '../lib/api'

const navLinks = [
  { to: '/admin',            label: 'Dashboard',   icon: 'o' },
  { to: '/admin/orders',     label: 'Orders',      icon: '#' },
  { to: '/admin/products',   label: 'Products',    icon: 'P' },
  { to: '/admin/inventory',  label: 'Inventory',   icon: '=' },
  { to: '/admin/categories', label: 'Categories',  icon: 'C' },
  { to: '/admin/discounts',  label: 'Discounts',   icon: '%' },
  { to: '/admin/messages',   label: 'Messages',    icon: '@' },
  { to: '/admin/reviews',    label: 'Reviews',     icon: '*' },
  { to: '/admin/customers',  label: 'Customers',   icon: 'U' },
]

export default function AdminLayout() {
  const [session, setSession] = useState(undefined)
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#1e293b', borderRight: 'none',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease'
      }} className="admin-sidebar">
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--admin-text)' }}>ETERNAL MENS</div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>Admin Panel</div>
          </div>
          <button className="admin-close-btn" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}>&times;</button>
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
                onClick={() => setSidebarOpen(false)}
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
            View Store &rarr;
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main" style={{ flex: 1, minHeight: '100vh', background: 'var(--admin-bg-main)', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        <div className="admin-mobile-header" style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: '#1e293b', borderBottom: '1px solid var(--admin-border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem' }}>
            &#9776;
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--admin-text)', marginLeft: '1rem' }}>ETERNAL MENS Admin</span>
        </div>

        <div className="admin-content-inner" style={{ padding: '2rem', flex: 1, overflowX: 'auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        .admin-mobile-header { display: none !important; }
        .admin-close-btn { display: none !important; }
        .admin-main { margin-left: 220px; max-width: calc(100vw - 220px); }
        
        @media (max-width: 768px) {
          .admin-sidebar { width: 250px; transform: translateX(-100%); }
          .admin-main { margin-left: 0 !important; max-width: 100vw; }
          .admin-mobile-header { display: flex !important; }
          .admin-close-btn { display: block !important; }
          .admin-content-inner { padding: 1.25rem 1rem !important; }
        }
        .admin-sidebar a:hover { color: #f8c55b !important; }
      `}</style>
    </div>
  )
}
