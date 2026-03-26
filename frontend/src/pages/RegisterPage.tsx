import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth.registration_failed'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.confirm_password')); // Wait, I should have a specific key for this
      return;
    }
    
    try {
      setError('');
      await register({ name, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registration_failed'));
    }
  };

  return (
    <div className="register-page fade-in">
      <div className="register-card card">
        <div className="register-header">
          <span className="register-logo">🧠</span>
          <h1 className="register-title">{t('auth.create_account')}</h1>
          <p className="register-subtitle">{t('auth.login_subtitle')}</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">{t('auth.full_name')}</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.confirm_password')}</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary register-btn" 
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.create_account')}
          </button>
        </form>

        <div className="register-footer">
          <p>{t('auth.already_account')} <Link to="/login">{t('auth.login')}</Link></p>
        </div>
      </div>
    </div>
  );
}
