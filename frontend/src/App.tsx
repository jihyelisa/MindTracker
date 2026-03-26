import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import NewEntryPage from './pages/NewEntryPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(nextLang);
  };

  if (loading) {
    return <div className="loading-screen">{t('common.loading')}</div>;
  }

  return (
    <div className="app-layout">
      <button className="fixed-lang-toggle" onClick={toggleLanguage} title="Change Language">
        {i18n.language === 'ko' ? '🇺🇸 EN' : '🇰🇷 KO'}
      </button>
      
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/new" element={<NewEntryPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
