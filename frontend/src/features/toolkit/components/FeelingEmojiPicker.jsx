import React from 'react';
import '../styles/hairGoalsDiary.css';

const FEELING_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Dry' },
  { value: 2, emoji: '🙂', label: 'Okay' },
  { value: 3, emoji: '😊', label: 'Soft' },
  { value: 4, emoji: '😍', label: 'Healthy' },
  { value: 5, emoji: '🤩', label: 'Amazing' },
];

export default function FeelingEmojiPicker({ value, onChange }) {
  return (
    <div className="hgd-feeling-picker">
      {FEELING_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          className={`hgd-feeling-option ${value === option.value ? 'selected' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <span className="hgd-feeling-emoji">{option.emoji}</span>
          <span className="hgd-feeling-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
