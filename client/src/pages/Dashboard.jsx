import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#F85149', '#2F81F7', '#D29922', '#3FB950'];

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <div style={{ fontSize: '20px' }}>{icon}</div>
    <div style={{
      fontSize: '28px',
      fontWeight: 700,
      color: color || 'var(--text-primary)',
      letterSpacing: '-1px',
      lineHeight: 1
    }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/review');
      const data = res.data;
      setReviews(data);
      if (data.length > 0) {
        const issueTypes = { bug: 0, security: 0, performance: 0, style: 0 };
        data.forEach(r => r.issues?.forEach(issue => {
          if (issueTypes[issue.type] !== undefined) issueTypes[issue.type]++;
        }));
        const scoreHistory = data.slice(0, 10).reverse().map((r, i) => ({
          name: `#${i + 1}`, score: r.score
        }));
        setStats({ issueTypes, scoreHistory });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = stats ? [
    { name: 'Bugs', value: stats.issueTypes.bug },
    { name: 'Security', value: stats.issueTypes.security },
    { name: 'Performance', value: stats.issueTypes.performance },
    { name: 'Style', value: stats.issueTypes.style }
  ].filter(d => d.value > 0) : [];

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      color: 'var(--text-primary)',
      fontSize: '12px'
    }
  };

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Here's your coding progress overview
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon="📝" label="Total Reviews" value={reviews.length} />
          <StatCard icon="⭐" label="Average Score" value={`${user?.avgScore || 0}`} color={getScoreColor(user?.avgScore || 0)} />
          <StatCard icon="🔥" label="Current Streak" value={user?.streak?.current || 0} color="var(--warning)" />
          <StatCard icon="🏆" label="Longest Streak" value={user?.streak?.longest || 0} color="var(--accent)" />
        </div>

        {reviews.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No reviews yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Submit your first code review to see your stats
            </p>
            <button
              onClick={() => navigate('/review')}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Start Reviewing →
            </button>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Score Over Time
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats?.scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {pieData.length > 0 && (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Issue Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                      <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recent Reviews
                </h3>
                <button
                  onClick={() => navigate('/history')}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  View all →
                </button>
              </div>

              {reviews.slice(0, 5).map((review, i) => (
                <div
                  key={review._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 20px',
                    borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    minWidth: '80px',
                    textAlign: 'center',
                    border: '1px solid var(--accent-border)'
                  }}>{review.language}</span>

                  <span style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: getScoreColor(review.score),
                    minWidth: '60px'
                  }}>{review.score}/100</span>

                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', flex: 1 }}>
                    {review.issues?.length} issues found
                  </span>

                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;