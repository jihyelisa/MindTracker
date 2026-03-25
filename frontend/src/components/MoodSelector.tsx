import type { MoodLevel } from '../types';
import './MoodSelector.css';

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

interface Props {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel) => void;
}

export default function MoodSelector({ value, onChange }: Props) {
  return (
    <div className="mood-selector">
      {([1, 2, 3, 4, 5] as MoodLevel[]).map(level => (
        <button
          key={level}
          type="button"
          className={`mood-btn mood-btn--${level}${value === level ? ' mood-btn--selected' : ''}`}
          onClick={() => onChange(level)}
          aria-label={MOOD_LABELS[level]}
          title={MOOD_LABELS[level]}
        >
          <span className="mood-emoji">{MOOD_EMOJIS[level]}</span>
          <span className="mood-label">{MOOD_LABELS[level]}</span>
        </button>
      ))}
    </div>
  );
}
