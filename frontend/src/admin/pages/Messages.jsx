import React, { useEffect, useState } from 'react'
import { adminGetMessages, adminMarkMessageRead } from '../../lib/api'

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

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Messages {unread > 0 && <span style={{ fontSize: '0.9rem', color: 'var(--brass-soft)', fontFamily: 'var(--font-mono)' }}>({unread} unread)</span>}
      </h1>

      {loading ? (
        <p style={{ color: 'var(--graphite-soft)' }}>Loading...</p>
      ) : messages.length === 0 ? (
        <p style={{ color: 'var(--graphite-soft)' }}>No messages yet.</p>
      ) : (
        <div className="msg-grid">
          {/* List */}
          <div style={{ background: '#1a1a1c', border: '1px solid #2a2a2d', overflow: 'hidden' }}>
            {messages.map(m => (
              <div
                key={m.id}
                onClick={() => openMessage(m)}
                style={{
                  padding: '1rem 1.25rem', borderBottom: '1px solid #1e1e20', cursor: 'pointer',
                  background: selected?.id === m.id ? '#242424' : 'transparent',
                  borderLeft: !m.is_read ? '3px solid var(--brass)' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: m.is_read ? 400 : 600, fontSize: '0.85rem' }}>{m.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--graphite-soft)' }}>{new Date(m.created_at).toLocaleDateString('en-PK')}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--graphite-soft)', marginTop: '0.2rem' }}>{m.email}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--graphite-soft)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div style={{ background: '#1a1a1c', border: '1px solid #2a2a2d', padding: '1.5rem' }}>
            {!selected ? (
              <p style={{ color: 'var(--graphite-soft)', fontSize: '0.85rem' }}>Select a message to read it.</p>
            ) : (
              <>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{selected.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--brass-soft)', marginBottom: '0.25rem' }}>
                  <a href={`mailto:${selected.email}`} style={{ color: 'inherit' }}>{selected.email}</a>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--graphite-soft)', marginBottom: '1.5rem' }}>
                  {new Date(selected.created_at).toLocaleString('en-PK')}
                </p>
                <p style={{ lineHeight: 1.8, color: 'var(--bone)', fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                <div style={{ marginTop: '1.5rem' }}>
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your message to Eternal Mens`}
                    style={{ background: 'var(--brass)', color: 'var(--bone)', padding: '0.6rem 1.25rem', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}
                  >
                    Reply via Email
                  </a>
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
