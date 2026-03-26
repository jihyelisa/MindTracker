import { useTranslation } from 'react-i18next';
import type { MoodLevel } from '../types';
import './MoodSelector.css';

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

interface Props {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel) => void;
}

export default function MoodSelector({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mood-selector">
      {([1, 2, 3, 4, 5] as MoodLevel[]).map(level => (
        <button
          key={level}
          type="button"
          className={`mood-btn mood-btn--${level}${value === level ? ' mood-btn--selected' : ''}`}
          onClick={() => onChange(level)}
          aria-label={t(`common.moods.${level}`)}
          title={t(`common.moods.${level}`)}
        >
          <span className="mood-emoji">{MOOD_EMOJIS[level]}</span>
          <span className="mood-label">{t(`common.moods.${level}`)}</span>
        </button>
      ))}
    </div>
  );
}
