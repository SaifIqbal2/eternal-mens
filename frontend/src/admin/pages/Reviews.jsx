import React, { useEffect, useState } from 'react'
import { adminGetReviews, adminUpdateReviewStatus, adminDeleteReview } from '../../lib/api'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = () => {
    setLoading(true)
    adminGetReviews()
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleToggleApproval = async (review) => {
    try {
      await adminUpdateReviewStatus(review.id, !review.is_approved)
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: !review.is_approved } : r))
    } catch (e) {
      alert('Error updating review status: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return
    try {
      await adminDeleteReview(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      alert('Error deleting review: ' + e.message)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Customer Reviews</h1>

      <div style={{ background: 'var(--admin-bg-sec)', padding: '1.5rem', border: '1px solid var(--admin-border)', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', marginBottom: 0 }}>
          New reviews stay hidden until you approve them. Approved reviews are visible on the product page.
        </p>
      </div>

      <div style={{ background: 'var(--admin-bg-sec)', border: '1px solid var(--admin-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Product</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Customer</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Rating</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Review</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Submitted</th>
              <th style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', fontWeight: 400, textTransform: 'uppercase', fontSize: '0.7rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '1rem' }}>Loading...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '1rem' }}>No reviews found.</td></tr>
            ) : reviews.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {r.product ? (
                    <a href={`/product/${r.product.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--admin-text)', textDecoration: 'underline' }}>
                      {r.product.name}
                    </a>
                  ) : 'Unknown'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{r.author_name}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--brass)' }}>
                  {'â˜…'.repeat(r.rating)}{'â˜†'.repeat(5 - r.rating)}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.body}>
                  {r.body}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', background: r.is_approved ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: r.is_approved ? '#4CAF50' : '#F44336' }}>
                    {r.is_approved ? 'Approved' : 'Hidden'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--admin-text-muted)' }}>
                  {new Date(r.created_at).toLocaleDateString('en-PK')}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleToggleApproval(r)}
                      style={{ padding: '0.35rem 0.6rem', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.7rem', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      {r.is_approved ? 'Hide' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      style={{ padding: '0.35rem 0.6rem', border: '1px solid #F44336', background: 'rgba(244, 67, 54, 0.05)', color: '#F44336', fontSize: '0.7rem', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
