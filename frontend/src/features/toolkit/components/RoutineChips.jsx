import React from 'react';
import '../styles/hairGoalsDiary.css';

const ROUTINE_OPTIONS = [
  { id: 'no-heat', label: 'No Heat', emoji: '🔥' },
  { id: 'oil-massage', label: 'Oil Massage', emoji: '💆' },
  { id: 'deep-conditioning', label: 'Deep Conditioning', emoji: '💧' },
  { id: 'silk-pillowcase', label: 'Silk Pillowcase', emoji: '😴' },
  { id: 'hair-mask', label: 'Hair Mask', emoji: '🧴' },
  { id: 'protective-style', label: 'Protective Style', emoji: '🌀' },
  { id: 'trim-ends', label: 'Trim Ends', emoji: '✂️' },
  { id: 'new-product', label: 'New Product', emoji: '✨' },
  { id: 'hydrating-shampoo', label: 'Hydrating Shampoo', emoji: '🧼' },
];

export default function RoutineChips({ selectedTags = [], onChange, maxSelection = 3 }) {
  const handleToggle = (optionLabel) => {
    if (selectedTags.includes(optionLabel)) {
      // Remove
      onChange(selectedTags.filter(tag => tag !== optionLabel));
    } else {
      // Add (if under max)
      if (selectedTags.length < maxSelection) {
        onChange([...selectedTags, optionLabel]);
      }
    }
  };

  return (
    <div className="hgd-routine-chips">
      {ROUTINE_OPTIONS.map(option => {
        const isSelected = selectedTags.includes(option.label);
        const isDisabled = !isSelected && selectedTags.length >= maxSelection;
        
        return (
          <button
            key={option.id}
            type="button"
            className={`hgd-routine-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => handleToggle(option.label)}
            disabled={isDisabled}
          >
            <span className="hgd-routine-chip-emoji">{option.emoji}</span>
            <span className="hgd-routine-chip-label">{option.label}</span>
          </button>
        );
      })}
      
      {selectedTags.length >= maxSelection && (
        <p className="hgd-routine-chips-hint">
          Maximum {maxSelection} selected
        </p>
      )}
    </div>
  );
}
