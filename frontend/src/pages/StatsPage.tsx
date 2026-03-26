import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { fetchStats } from '../services/api';
import type { StatsData, MoodLevel } from '../types';
import { MOOD_EMOJIS } from '../components/MoodSelector';
import InsightCard from '../components/InsightCard';
import './StatsPage.css';

const MOOD_COLORS: Record<number, string> = {
  1: '#ef8c8c', 2: '#f4b87a', 3: '#f7d76a', 4: '#8ecf7d', 5: '#5db87a'
};

export default function StatsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchStats(user.id, days).then(setStats).finally(() => setLoading(false));
  }, [user, days]);

  return (
    <div className="stats fade-in">
      <header className="page-header">
        <h1 className="page-title">{t('stats.title')}</h1>
        <p className="page-subtitle">{t('stats.subtitle')}</p>
      </header>

      {/* Period filter */}
      <div className="stats-period">
        {[7, 14, 30].map(d => (
          <button
            key={d}
            className={`period-btn${days === d ? ' period-btn--active' : ''}`}
            onClick={() => setDays(d)}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="stats-grid">
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }} />)}
        </div>
      ) : stats ? (
        <>
          {/* Mood Trend Chart */}
          <section className="stats-section card">
            <h2 className="stats-chart-title">{t('stats.mood_trend')}</h2>
            {stats.moodTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stats.moodTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={d => d.slice(5)}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [`${val} — ${MOOD_EMOJIS[Number(val) as MoodLevel]}`, t('stats.mood_label')]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(l: any) => `${t('stats.date_label')}: ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#7c6af7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#7c6af7' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="stats-empty">{t('stats.no_trend_data')}</p>
            )}
          </section>

          {/* Mood Distribution */}
          <div className="grid-2">
            <section className="stats-section card">
              <h2 className="stats-chart-title">{t('stats.mood_distribution')}</h2>
              {stats.moodDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stats.moodDistribution} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis
                      dataKey="mood"
                      tick={{ fontSize: 12 }}
                      tickFormatter={m => MOOD_EMOJIS[m as MoodLevel]}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(val: any) => [Number(val), t('stats.entries_label')]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(m: any) => MOOD_EMOJIS[m as MoodLevel]}
                    />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {stats.moodDistribution.map(entry => (
                        <Cell key={entry.mood} fill={MOOD_COLORS[entry.mood]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="stats-empty">{t('common.no_data')}</p>
              )}
            </section>

            {/* Tag Analysis */}
            <section className="stats-section card">
              <h2 className="stats-chart-title">{t('stats.top_tags')}</h2>
              {stats.tagAnalysis.length > 0 ? (
                <div className="tag-analysis">
                  {stats.tagAnalysis.slice(0, 8).map(({ tag, count }) => {
                    const max = stats.tagAnalysis[0].count;
                    return (
                      <div key={tag} className="tag-row">
                        <span className="tag-name badge">{tag}</span>
                        <div className="tag-bar-bg">
                          <div
                            className="tag-bar-fill"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <span className="tag-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="stats-empty">{t('common.no_data')}</p>
              )}
            </section>
          </div>

          {/* AI Insight */}
          {user && (
            <section className="stats-section">
              <h2 className="section-title" style={{ marginBottom: '0.85rem' }}>{t('stats.ai_analysis')}</h2>
              <InsightCard userId={user.id} />
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
