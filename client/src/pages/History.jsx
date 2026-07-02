import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const LANGUAGES = ['all', 'javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust', 'php'];

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'var(--danger)';
    case 'warning': return 'var(--warning)';
    case 'suggestion': return 'var(--success)';
    default: return 'var(--text-muted)';
  }
};

const History = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchReviews(); }, []);
  useEffect(() => {
    setFiltered(filter === 'all' ? reviews : reviews.filter(r => r.language === filter));
  }, [filter, reviews]);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/review');
      setReviews(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/review/${id}`);
      setSelected(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/review/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) { console.error(err); }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Review History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {reviews.length} total reviews
            </p>
          </div>
          <button
            onClick={() => navigate('/review')}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + New Review
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              style={{
                background: filter === lang ? 'var(--accent)' : 'var(--bg-surface)',
                border: `1px solid ${filter === lang ? 'var(--accent)' : 'var(--border)'}`,
                color: filter === lang ? 'white' : 'var(--text-secondary)',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            No reviews found
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', alignItems: 'start' }}>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(review => (
                <div
                  key={review._id}
                  onClick={() => fetchDetail(review._id)}
                  style={{
                    background: selected?._id === review._id ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    border: `1px solid ${selected?._id === review._id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      border: '1px solid var(--accent-border)'
                    }}>{review.language}</span>
                    <span style={{ fontWeight: 700, color: getScoreColor(review.score), fontSize: '14px', flex: 1 }}>
                      {review.score}/100
                    </span>
                    <button
                      onClick={(e) => handleDelete(review._id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        opacity: 0.4,
                        padding: '2px'
                      }}
                    >🗑️</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>{review.issues?.length} issues</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              minHeight: '400px'
            }}>
              {!selected ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>👈</span>
                  <p style={{ fontSize: '14px' }}>Select a review to see details</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Detail Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      border: '1px solid var(--accent-border)'
                    }}>{selected.language}</span>
                    <span style={{ fontWeight: 700, color: getScoreColor(selected.score) }}>
                      Score: {selected.score}/100
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: 'auto' }}>
                      {new Date(selected.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Complexity */}
                  {selected.complexity && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>⏱ Time</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger)', fontFamily: 'monospace' }}>{selected.complexity.time?.current}</div>
                        {selected.complexity.time?.optimized !== selected.complexity.time?.current && (
                          <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontFamily: 'monospace' }}>→ {selected.complexity.time?.optimized}</div>
                        )}
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>💾 Space</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--warning)', fontFamily: 'monospace' }}>{selected.complexity.space?.current}</div>
                        {selected.complexity.space?.optimized !== selected.complexity.space?.current && (
                          <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', fontFamily: 'monospace' }}>→ {selected.complexity.space?.optimized}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.summary}</p>
                  </div>

                  {/* Issues */}
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Issues ({selected.issues?.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selected.issues?.map((issue, i) => (
                        <div key={i} style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderLeft: `3px solid ${getSeverityColor(issue.severity)}`,
                          borderRadius: '8px',
                          padding: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{issue.type}</span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: getSeverityColor(issue.severity),
                              textTransform: 'uppercase',
                              marginLeft: 'auto',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: `${getSeverityColor(issue.severity)}18`
                            }}>{issue.severity}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: issue.before ? '8px' : 0 }}>
                            {issue.message}
                          </p>
                          {issue.before && (
                            <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '11px' }}>
                              {issue.before.split('\n').map((line, j) => (
                                <div key={j} style={{ padding: '3px 10px', background: 'rgba(248,81,73,0.08)', color: 'var(--danger)', display: 'flex', gap: '8px' }}>
                                  <span style={{ opacity: 0.6 }}>−</span><code>{line}</code>
                                </div>
                              ))}
                              {issue.after?.split('\n').map((line, j) => (
                                <div key={j} style={{ padding: '3px 10px', background: 'rgba(63,185,80,0.08)', color: 'var(--success)', display: 'flex', gap: '8px' }}>
                                  <span style={{ opacity: 0.6 }}>+</span><code>{line}</code>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;