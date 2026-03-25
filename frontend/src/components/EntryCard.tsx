import type { Entry } from '../types';
import { MOOD_EMOJIS, MOOD_LABELS } from './MoodSelector';
import type { MoodLevel } from '../types';
import './EntryCard.css';

interface Props {
  entry: Entry;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

export default function EntryCard({ entry, onClick, onDelete, onEdit, compact }: Props) {
  const mood = entry.mood as MoodLevel;
  return (
    <article
      className={`entry-card entry-card--mood-${mood}${onClick ? ' entry-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="entry-card-header">
        <div className="entry-card-mood">
          <span className="entry-card-emoji">{MOOD_EMOJIS[mood]}</span>
          <span className="entry-card-mood-label">{MOOD_LABELS[mood]}</span>
        </div>
        <time className="entry-card-date">{formatDate(entry.date)}</time>
      </div>

      {entry.text && (
        <p className={`entry-card-text${compact ? ' entry-card-text--compact' : ''}`}>
          {entry.text}
        </p>
      )}

      {entry.tags.length > 0 && (
        <div className="entry-card-tags">
          {entry.tags.map(tag => (
            <span key={tag.id} className="badge">{tag.name}</span>
          ))}
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="entry-card-actions" onClick={e => e.stopPropagation()}>
          {onEdit && (
            <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>
          )}
          {onDelete && (
            <button className="btn btn-ghost btn-sm btn-danger" onClick={onDelete}>Delete</button>
          )}
        </div>
      )}
    </article>
  );
}
