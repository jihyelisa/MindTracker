import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/new', label: 'New Entry', icon: '✏️' },
  { to: '/history', label: 'History', icon: '📖' },
  { to: '/stats', label: 'Stats', icon: '📊' },
];

export default function Navbar() {
  const { user, isDemo } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="navbar-sidebar">
        <div className="navbar-brand">
          <span className="navbar-logo">🧠</span>
          <span className="navbar-title">Mind Tracker</span>
        </div>

        {isDemo && (
          <div className="demo-badge">
            <span className="demo-dot" />
            Demo Mode
          </div>
        )}

        <ul className="navbar-links">
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `navbar-link${isActive ? ' navbar-link--active' : ''}`
                }
              >
                <span className="navbar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar">{user.name[0]}</div>
            <div>
              <div className="navbar-user-name">{user.name}</div>
              <div className="navbar-user-email">{user.email}</div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom bar */}
      <nav className="navbar-mobile">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `navbar-mobile-link${isActive ? ' navbar-mobile-link--active' : ''}`
            }
          >
            <span>{item.icon}</span>
            <span className="navbar-mobile-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
