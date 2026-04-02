import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, loginDemo, loading } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.invalid_credentials'));
      triggerShake();
      return;
    }
    try {
      setError('');
      await login({ email, password });
    } catch (err: any) {
      const msg = err.response?.data?.message || t('auth.invalid_credentials');
      setError(msg);
      triggerShake();
    }
  };

  const handleDemoLogin = async () => {
    try {
      setError('');
      await loginDemo();
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
      triggerShake();
    }
  };

  return (
    <div className="login-page fade-in">
      <div className={`login-card card ${shake ? 'shake' : ''}`}>
        <div className="login-header">
          <span className="login-logo">🧠</span>
          <h1 className="login-title">{t('auth.login_title')}</h1>
          <p className="login-subtitle">{t('auth.login_subtitle')}</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.login_btn')}
          </button>
        </form>

        <div className="login-divider">
          <span>{t('auth.login')}</span>
        </div>

        <div className="login-content">
          <button 
            className="btn btn-outline login-btn" 
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {t('auth.demo_login_btn')}
          </button>
          
          <p className="login-footer">
            {t('auth.no_account')} <Link to="/register">{t('auth.sign_up')}</Link>
          </p>
          <p className="login-footer" style={{ marginTop: '0.5rem', opacity: 0.6 }}>
            Demo: demo@mindtracker.app / password123
          </p>
        </div>
      </div>
    </div>
  );
}
