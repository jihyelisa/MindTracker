import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTags, createEntry, fetchTagSuggestions } from '../services/api';
import type { Tag, MoodLevel } from '../types';
import MoodSelector from '../components/MoodSelector';
import './NewEntryPage.css';

const PROMPTS = [
  "What made you smile today?",
  "What's one thing you're grateful for right now?",
  "What challenged you today and how did you handle it?",
  "Describe how your body is feeling right now.",
  "What's on your mind that you haven't said out loud?",
];

export default function NewEntryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [suggestedTagNames, setSuggestedTagNames] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];

  useEffect(() => {
    fetchTags().then(setTags);
  }, []);

  const toggleTag = (id: number) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSuggestTags = async () => {
    if (!text.trim()) { setError('Write something first to get tag suggestions.'); return; }
    setError('');
    setLoadingSuggestions(true);
    try {
      const res = await fetchTagSuggestions(text);
      setSuggestedTagNames(res.tags);
    } catch {
      setError('Failed to get suggestions. Try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const acceptSuggested = (name: string) => {
    const existing = tags.find(t => t.name === name);
    if (existing) {
      setSelectedTagIds(prev => new Set([...prev, existing.id]));
    }
    setSuggestedTagNames(prev => prev.filter(t => t !== name));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!mood) { setError('Please select a mood.'); return; }
    setError('');
    setSaving(true);
    try {
      await createEntry(user.id, {
        date: new Date().toISOString(),
        mood,
        text,
        tagIds: Array.from(selectedTagIds),
      });
      navigate('/history');
    } catch {
      setError('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="new-entry fade-in">
      <header className="page-header">
        <h1 className="page-title">New Entry</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {error && <div className="form-error">{error}</div>}

      {/* Prompt of the day */}
      <div className="prompt-card card">
        <span className="prompt-label">Prompt of the day</span>
        <p className="prompt-text">"{prompt}"</p>
      </div>

      {/* Mood selector */}
      <section className="form-section card">
        <h2 className="form-section-title">How are you feeling? <span className="required">*</span></h2>
        <MoodSelector value={mood} onChange={setMood} />
      </section>

      {/* Journal text */}
      <section className="form-section card">
        <h2 className="form-section-title">Write about it</h2>
        <textarea
          className="journal-textarea"
          placeholder="What's on your mind..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
        />
        <div className="textarea-actions">
          <span className="char-count">{text.length} chars</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSuggestTags}
            disabled={loadingSuggestions || !text.trim()}
          >
            {loadingSuggestions ? 'Analyzing...' : '✨ Suggest Tags'}
          </button>
        </div>

        {/* AI-suggested tags */}
        {suggestedTagNames.length > 0 && (
          <div className="suggested-tags">
            <p className="suggested-label">✨ AI Suggestions — click to add:</p>
            <div className="tag-chips">
              {suggestedTagNames.map(name => (
                <button
                  key={name}
                  type="button"
                  className="tag-chip tag-chip--suggested"
                  onClick={() => acceptSuggested(name)}
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Tags */}
      <section className="form-section card">
        <h2 className="form-section-title">Tags</h2>
        <div className="tag-chips">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              className={`tag-chip${selectedTagIds.has(tag.id) ? ' tag-chip--selected' : ''}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !mood}
        >
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}
