import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEntries, fetchWeeklySummary } from '../services/api';
import type { Entry, WeeklySummary } from '../types';
import type { MoodLevel } from '../types';
import EntryCard from '../components/EntryCard';
import InsightCard from '../components/InsightCard';
import { MOOD_EMOJIS } from '../components/MoodSelector';
import './DashboardPage.css';

function MoodBar({ avg }: { avg: number }) {
  const pct = ((avg - 1) / 4) * 100;
  return (
    <div className="mood-bar">
      <div className="mood-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toDateString();
  const hasLoggedToday = entries.some(e => new Date(e.date).toDateString() === today);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchEntries(user.id, undefined, 10),
      fetchWeeklySummary(user.id),
    ]).then(([e, s]) => {
      setEntries(e);
      setSummary(s);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const recentEntries = entries.slice(0, 3);

  return (
    <div className="dashboard fade-in">
      <header className="page-header">
        <h1 className="page-title">Good {getGreeting()}, {user.name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Today's status */}
      <div className={`today-status card ${hasLoggedToday ? 'today-status--done' : 'today-status--pending'}`}>
        {hasLoggedToday ? (
          <>
            <span className="today-icon">✅</span>
            <span className="today-text">You've logged today's mood!</span>
          </>
        ) : (
          <>
            <span className="today-icon">📝</span>
            <span className="today-text">How are you feeling today?</span>
            <Link to="/new" className="btn btn-primary today-cta">Log Mood</Link>
          </>
        )}
      </div>

      {/* Weekly summary */}
      <section className="dashboard-section">
        <h2 className="section-title">This Week</h2>
        {loading ? (
          <div className="grid-3">
            {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '80px' }} />)}
          </div>
        ) : summary ? (
          <div className="grid-3">
            <div className="stat-card card">
              <div className="stat-value">{summary.averageMood.toFixed(1)}</div>
              <div className="stat-emoji">{MOOD_EMOJIS[Math.round(summary.averageMood) as MoodLevel]}</div>
              <div className="stat-label">Avg Mood</div>
              <MoodBar avg={summary.averageMood} />
            </div>
            <div className="stat-card card">
              <div className="stat-value">{summary.streak}</div>
              <div className="stat-emoji">🔥</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{summary.totalEntries}</div>
              <div className="stat-emoji">📖</div>
              <div className="stat-label">Entries This Week</div>
            </div>
          </div>
        ) : null}
      </section>

      {/* AI Insight */}
      <section className="dashboard-section">
        <h2 className="section-title">Mind Insight</h2>
        <InsightCard userId={user.id} />
      </section>

      {/* Recent entries */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Entries</h2>
          <Link to="/history" className="btn btn-ghost">View All</Link>
        </div>
        {loading ? (
          <div className="entry-list">
            {[1,2].map(i => <div key={i} className="card skeleton" style={{ height: '100px' }} />)}
          </div>
        ) : recentEntries.length > 0 ? (
          <div className="entry-list">
            {recentEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No entries yet. <Link to="/new">Log your first mood!</Link></p>
          </div>
        )}
      </section>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
