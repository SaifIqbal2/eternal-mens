import React, { useEffect, useState } from 'react'
import { adminGetMessages, adminMarkMessageRead, adminDeleteMessage } from '../../lib/api'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    adminGetMessages().then(setMessages).catch(console.error).finally(() => setLoading(false))
  }, [])

  const openMessage = async (msg) => {
    setSelected(msg)
    if (!msg.is_read) {
      await adminMarkMessageRead(msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
    }
  }

  const unread = messages.filter(m => !m.is_read).length

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await adminDeleteMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (e) { alert('Error: ' + e.message) }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Messages {unread > 0 && <span style={{ fontSize: '0.9rem', color: 'var(--brass-soft)', fontFamily: 'var(--font-mono)' }}>({unread} unread)</span>}
      </h1>

      {loading ? (
        <p style={{ color: 'var(--admin-text-muted)' }}>Loading...</p>
      ) : messages.length === 0 ? (
        <p style={{ color: 'var(--admin-text-muted)' }}>No messages yet.</p>
      ) : (
        <div className="msg-grid">
          {/* List */}
          <div style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', overflow: 'hidden' }}>
            {messages.map(m => (
              <div
                key={m.id}
                onClick={() => openMessage(m)}
                style={{
                  padding: '1rem 1.25rem', borderBottom: '1px solid var(--admin-border)', cursor: 'pointer',
                  background: selected?.id === m.id ? '#242424' : 'transparent',
                  borderLeft: !m.is_read ? '3px solid var(--brass)' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: m.is_read ? 400 : 600, fontSize: '0.85rem' }}>{m.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{new Date(m.created_at).toLocaleDateString('en-PK')}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>{m.email}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border-strong)', padding: '1.5rem' }}>
            {!selected ? (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Select a message to read it.</p>
            ) : (
              <>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{selected.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--brass-soft)', marginBottom: '0.25rem' }}>
                  <a href={`mailto:${selected.email}`} style={{ color: 'inherit' }}>{selected.email}</a>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '1.5rem' }}>
                  {new Date(selected.created_at).toLocaleString('en-PK')}
                </p>
                <p style={{ lineHeight: 1.8, color: 'var(--admin-text)', fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your message to Eternal Mens`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: 'var(--brass)', color: 'var(--admin-text)', padding: '0.6rem 1.25rem', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    style={{ background: 'none', border: '1px solid #a83232', color: '#a83232', padding: '0.6rem 1.25rem', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    Delete Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .msg-grid { display: grid; gap: 1rem; }
        @media (min-width: 768px) { .msg-grid { grid-template-columns: 320px 1fr; } }
      `}</style>
    </div>
  )
}
