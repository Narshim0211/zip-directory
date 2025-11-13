import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  mode = 'create', // 'create' or 'edit'
  showAssigned = false,
  assignmentSuggestions = [] // Optional list of staff/services
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    scope: initialData.scope || 'daily',
    session: initialData.session || 'Morning',
    status: initialData.status || 'pending',
    priority: initialData.priority || 'medium',
    estimatedDuration: initialData.estimatedDuration || 30,
    assignedTo: initialData.metadata?.assignedTo || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.estimatedDuration < 5 || formData.estimatedDuration > 480) {
      newErrors.estimatedDuration = 'Duration must be between 5 and 480 minutes';
    }

    if (showAssigned && formData.assignedTo && formData.assignedTo.length > 80) {
      newErrors.assignedTo = 'Assigned To must be less than 80 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h3>

      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
          disabled={isSubmitting}
          placeholder="Enter task title"
          maxLength={100}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'error' : ''}
          disabled={isSubmitting}
          placeholder="Add details about this task..."
          rows={3}
          maxLength={500}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="scope">Scope</label>
          <select
            id="scope"
            name="scope"
            value={formData.scope}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="session">Session</label>
          <select
            id="session"
            name="session"
            value={formData.session}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estimatedDuration">Duration (min)</label>
          <input
            type="number"
            id="estimatedDuration"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            className={errors.estimatedDuration ? 'error' : ''}
            disabled={isSubmitting}
            min={5}
            max={480}
            step={5}
          />
          {errors.estimatedDuration && (
            <span className="error-message">{errors.estimatedDuration}</span>
          )}
        </div>
      </div>

      {showAssigned && (
        <div className="form-group">
          <label htmlFor="assignedTo">Assigned To (Staff/Service)</label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className={errors.assignedTo ? 'error' : ''}
            disabled={isSubmitting}
            placeholder="e.g., Jamie (Stylist) or Bridal Trial"
            maxLength={80}
            list="assignment-suggestions"
          />
          {assignmentSuggestions.length > 0 && (
            <datalist id="assignment-suggestions">
              {assignmentSuggestions.map((opt, i) => (
                <option key={i} value={opt} />
              ))}
            </datalist>
          )}
          {errors.assignedTo && <span className="error-message">{errors.assignedTo}</span>}
        </div>
      )}

      {mode === 'edit' && (
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {errors.submit && (
        <div className="error-message submit-error">{errors.submit}</div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
