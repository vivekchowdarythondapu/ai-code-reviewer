import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/review', label: 'Review' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/history', label: 'History' },
    { to: '/team', label: 'Team' }
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '56px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          background: 'var(--accent)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0
        }}>A</div>
        <span style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px'
        }}>
          AI Code Reviewer
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {links.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                border: isActive ? '1px solid var(--border)' : '1px solid transparent'
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px'
        }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--accent)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'var(--danger)';
            e.target.style.color = 'var(--danger)';
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;