import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEP_TYPES = [
  'Wash Day',
  'Deep Condition',
  'Oil Treatment',
  'Protective Style',
  'Scalp Massage',
  'Leave-in Care',
  'Trim/Dust',
  'Other'
];

/**
 * RoutineStep - Single step in the routine builder
 */
const RoutineStep = ({ step, index, onChange, onDelete }) => {
  const handleChange = (field, value) => {
    onChange(index, { ...step, [field]: value });
  };

  return (
    <div className="routine-step">
      <div className="routine-step__header">
        <div className="routine-step__number">{index + 1}</div>
        <button
          className="routine-step__delete"
          onClick={() => onDelete(index)}
          aria-label="Delete step"
        >
          ×
        </button>
      </div>

      <div className="routine-step__row">
        <select
          className="routine-step__select"
          value={step.day || ''}
          onChange={(e) => handleChange('day', e.target.value)}
        >
          <option value="">Select day</option>
          {DAYS.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <select
          className="routine-step__select"
          value={step.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">Select activity</option>
          {STEP_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="routine-step__row">
        <input
          type="text"
          className="routine-step__input"
          placeholder="Product to use (optional)"
          value={step.product || ''}
          onChange={(e) => handleChange('product', e.target.value)}
        />
      </div>
    </div>
  );
};

export default RoutineStep;
