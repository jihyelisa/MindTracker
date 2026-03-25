import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEntries, fetchTags, updateEntry, deleteEntry } from '../services/api';
import type { Entry, Tag, MoodLevel } from '../types';
import EntryCard from '../components/EntryCard';
import MoodSelector from '../components/MoodSelector';
import { MOOD_EMOJIS } from '../components/MoodSelector';
import './HistoryPage.css';

export default function HistoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState<number | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Edit state
  const [editMood, setEditMood] = useState<MoodLevel | null>(null);
  const [editText, setEditText] = useState('');
  const [editTagIds, setEditTagIds] = useState<Set<number>>(new Set());

  const loadEntries = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetchEntries(user.id, moodFilter).then(setEntries).finally(() => setLoading(false));
  }, [user, moodFilter]);

  useEffect(() => { loadEntries(); fetchTags().then(setTags); }, [loadEntries]);

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditMood(entry.mood as MoodLevel);
    setEditText(entry.text);
    setEditTagIds(new Set(entry.tags.map(t => t.id)));
    setExpandedId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!editingId || !editMood) return;
    await updateEntry(editingId, {
      mood: editMood,
      text: editText,
      tagIds: Array.from(editTagIds),
    });
    setEditingId(null);
    loadEntries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    await deleteEntry(id);
    loadEntries();
  };

  const toggleTag = (id: number) => {
    setEditTagIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="history fade-in">
      <header className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">All your mood entries</p>
      </header>

      {/* Mood filter */}
      <div className="history-filters card">
        <span className="filter-label">Filter by mood:</span>
        <div className="filter-chips">
          <button
            className={`filter-chip${!moodFilter ? ' filter-chip--active' : ''}`}
            onClick={() => setMoodFilter(undefined)}
          >All</button>
          {([1,2,3,4,5] as MoodLevel[]).map(m => (
            <button
              key={m}
              className={`filter-chip${moodFilter === m ? ' filter-chip--active' : ''}`}
              onClick={() => setMoodFilter(moodFilter === m ? undefined : m)}
            >
              {MOOD_EMOJIS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Entry list */}
      {loading ? (
        <div className="entry-list">
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '100px' }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state card">No entries found.</div>
      ) : (
        <div className="entry-list">
          {entries.map(entry => (
            <div key={entry.id}>
              {editingId === entry.id ? (
                <div className="card edit-form">
                  <h3 className="edit-title">Edit Entry</h3>
                  <div className="edit-date">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
                  <MoodSelector value={editMood} onChange={setEditMood} />
                  <textarea
                    className="edit-textarea"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={4}
                  />
                  <div className="edit-tags">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`tag-chip${editTagIds.has(tag.id) ? ' tag-chip--selected' : ''}`}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  <div className="edit-actions">
                    <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                    <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                  </div>
                </div>
              ) : (
                <EntryCard
                  entry={entry}
                  compact={expandedId !== entry.id}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  onEdit={() => startEdit(entry)}
                  onDelete={() => handleDelete(entry.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
