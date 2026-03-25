import { useEffect, useState } from 'react';
import type { AiInsight } from '../types';
import { fetchAiInsight } from '../services/api';
import './InsightCard.css';

interface Props {
  userId: number;
}

export default function InsightCard({ userId }: Props) {
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAiInsight(userId)
      .then(setInsight)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="insight-card card">
      <div className="insight-card-header">
        <span className="insight-spark">✨</span>
        <span className="insight-title">Mind Insight</span>
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
        <span className="insight-title">Mind Insight</span>
        <span className="insight-badge">AI</span>
      </div>
      <p className="insight-summary">{insight.summary}</p>
      <div className="insight-suggestion">
        <span className="insight-suggestion-icon">💡</span>
        <p>{insight.suggestion}</p>
      </div>
    </div>
  );
}
