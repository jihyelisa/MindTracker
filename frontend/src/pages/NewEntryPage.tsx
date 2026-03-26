import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { fetchTags, createEntry, fetchTagSuggestions } from '../services/api';
import type { Tag, MoodLevel } from '../types';
import MoodSelector from '../components/MoodSelector';
import './NewEntryPage.css';

export default function NewEntryPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedTagNames, setSelectedTagNames] = useState<Set<string>>(new Set());
  const [suggestedTagNames, setSuggestedTagNames] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const prompts = t('new_entry.prompts', { returnObjects: true }) as string[];
  const prompt = prompts[new Date().getDate() % prompts.length];

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
    if (!text.trim()) { setError(t('new_entry.write_first_error')); return; }
    setError('');
    setLoadingSuggestions(true);
    try {
      const res = await fetchTagSuggestions(text, i18n.language);
      setSuggestedTagNames(res.tags);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const acceptSuggested = (name: string) => {
    const normalized = name.trim().toLowerCase();
    const existing = tags.find(t => t.name.toLowerCase() === normalized);
    
    if (existing) {
      setSelectedTagIds(prev => new Set([...prev, existing.id]));
    } else {
      setSelectedTagNames(prev => new Set([...prev, normalized]));
    }
    setSuggestedTagNames(prev => prev.filter(t => t !== name));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!mood) { setError(t('new_entry.select_mood_error')); return; }
    setError('');
    setSaving(true);
    try {
      await createEntry(user.id, {
        date: new Date().toISOString(),
        mood,
        text,
        tagIds: Array.from(selectedTagIds),
        tagNames: Array.from(selectedTagNames),
      });
      navigate('/history');
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="new-entry fade-in">
      <header className="page-header">
        <h1 className="page-title">{t('new_entry.title')}</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {error && <div className="form-error">{error}</div>}

      {/* Prompt of the day */}
      <div className="prompt-card card">
        <span className="prompt-label">{t('new_entry.prompt_label')}</span>
        <p className="prompt-text">"{prompt}"</p>
      </div>

      {/* Mood selector */}
      <section className="form-section card">
        <h2 className="form-section-title">{t('new_entry.mood_question')} <span className="required">*</span></h2>
        <MoodSelector value={mood} onChange={setMood} />
      </section>

      {/* Journal text */}
      <section className="form-section card">
        <h2 className="form-section-title">{t('new_entry.write_about_it')}</h2>
        <textarea
          className="journal-textarea"
          placeholder={t('new_entry.placeholder')}
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
        />
        <div className="textarea-actions">
          <span className="char-count">{t('new_entry.char_count', { count: text.length })}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSuggestTags}
            disabled={loadingSuggestions || !text.trim()}
          >
            {loadingSuggestions ? t('new_entry.analyzing') : t('new_entry.suggest_tags')}
          </button>
        </div>

        {/* AI-suggested tags */}
        {suggestedTagNames.length > 0 && (
          <div className="suggested-tags">
            <p className="suggested-label">✨ {t('new_entry.ai_suggestions')}</p>
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
        <h2 className="form-section-title">{t('new_entry.tags_label')}</h2>
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
          {Array.from(selectedTagNames).map(name => (
            <button
              key={name}
              type="button"
              className="tag-chip tag-chip--selected"
              onClick={() => setSelectedTagNames(prev => {
                const next = new Set(prev);
                next.delete(name);
                return next;
              })}
            >
              {name}
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
          {t('common.cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !mood}
        >
          {saving ? t('new_entry.saving') : t('new_entry.save_entry')}
        </button>
      </div>
    </div>
  );
}
