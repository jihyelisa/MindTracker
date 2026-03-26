import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/', label: 'nav.dashboard', icon: '🏠' },
  { to: '/new', label: 'nav.new_entry', icon: '✏️' },
  { to: '/history', label: 'nav.history', icon: '📖' },
  { to: '/stats', label: 'nav.stats', icon: '📊' },
];

export default function Navbar() {
  const { user, isDemo, logout } = useAuth();
  const { t } = useTranslation();

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
            {t('common.demo_mode')}
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
                <span>{t(item.label)}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar">{user.name[0]}</div>
            <div className="navbar-user-info">
              <div className="navbar-user-name">{user.name}</div>
              <div className="navbar-user-email">{user.email}</div>
            </div>
            <button className="navbar-logout-btn" onClick={logout} title={t('auth.logout')}>
              🚪
            </button>
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
            <span className="navbar-mobile-label">{t(item.label)}</span>
          </NavLink>
        ))}
        <button className="navbar-mobile-link navbar-mobile-logout" onClick={logout}>
          <span>🚪</span>
          <span className="navbar-mobile-label">{t('auth.logout')}</span>
        </button>
      </nav>
    </>
  );
}
