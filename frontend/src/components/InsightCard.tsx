import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AiInsight } from '../types';
import { fetchAiInsight } from '../services/api';
import './InsightCard.css';

interface Props {
  userId: number;
}

export default function InsightCard({ userId }: Props) {
  const { t, i18n } = useTranslation();
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const CACHE_KEY = `mindtracker_insight_${userId}_${i18n.language}`;

  const fetchNewInsight = async (force = false) => {
    setLoading(true);
    setError(false);
    
    const today = new Date().toDateString();
    
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { date, data } = JSON.parse(cached);
        if (date === today) {
          setInsight(data);
          setLoading(false);
          return;
        }
      }
    }

    try {
      const res = await fetchAiInsight(userId, i18n.language);
      setInsight(res);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, data: res }));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewInsight();
  }, [userId, i18n.language]);

  if (loading) return (
    <div className="insight-card card">
      <div className="insight-card-header">
        <span className="insight-spark">✨</span>
        <span className="insight-title">{t('insight.title')}</span>
      </div>
      <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '1rem', width: '80%', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: '1rem', width: '90%' }} />
    </div>
  );

  if (error || !insight) return null;

  return (
    <div className="insight-card card fade-in">
      <div className="insight-card-header">
        <span className="insight-spark">✨</span>
        <span className="insight-title">{t('insight.title')}</span>
        <div className="insight-header-actions">
          <button 
            className="insight-refresh-btn" 
            onClick={() => fetchNewInsight(true)}
          >
            <span className="insight-refresh-icon">🔄</span>
            <span className="insight-refresh-label">{t('insight.refresh')}</span>
          </button>
          <span className="insight-badge">{t('insight.ai_badge')}</span>
        </div>
      </div>
      <p className="insight-summary">{insight.summary}</p>
      <div className="insight-suggestion">
        <span className="insight-suggestion-icon">💡</span>
        <p>{insight.suggestion}</p>
      </div>
    </div>
  );
}
