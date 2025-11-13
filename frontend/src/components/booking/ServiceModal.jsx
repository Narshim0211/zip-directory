import React, { useState, useEffect } from 'react';

/**
 * Service Modal Component
 * For creating and editing services
 * Matches design spec: centered modal, max width 480px, clean form fields
 */
const ServiceModal = ({ isOpen, onClose, onSave, service = null, staff = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    duration: 30,
    price: 0,
    depositRequired: false,
    depositPercentage: 25,
    staffIds: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || 'other',
        duration: service.duration || 30,
        price: service.price || 0,
        depositRequired: service.depositRequired || false,
        depositPercentage: service.depositPercentage || 25,
        staffIds: service.staffIds || [],
        isActive: service.isActive !== undefined ? service.isActive : true,
      });
    }
  }, [service]);

  const categories = [
    { value: 'haircut', label: 'Haircut' },
    { value: 'coloring', label: 'Coloring' },
    { value: 'styling', label: 'Styling' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'nails', label: 'Nails' },
    { value: 'spa', label: 'Spa' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStaffToggle = (staffId) => {
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter(id => id !== staffId)
        : [...prev.staffIds, staffId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0px 4px 24px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E8EAED',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', margin: 0 }}>
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#5F6368',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#FFF4F4',
              border: '1px solid #FFD4D4',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#D93025',
              fontSize: '0.875rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Service Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1B1E28',
              marginBottom: '0.5rem'
            }}>
              Service Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Women's Haircut"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E8EAED',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A73E8'}
              onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1B1E28',
              marginBottom: '0.5rem'
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the service..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E8EAED',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A73E8'}
              onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1B1E28',
              marginBottom: '0.5rem'
            }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E8EAED',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A73E8'}
              onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Duration and Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1B1E28',
                marginBottom: '0.5rem'
              }}>
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="5"
                max="480"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E8EAED',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1A73E8'}
                onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1B1E28',
                marginBottom: '0.5rem'
              }}>
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E8EAED',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1A73E8'}
                onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
              />
            </div>
          </div>

          {/* Deposit Options */}
          <div style={{ marginBottom: '1rem', backgroundColor: '#F7F9FD', padding: '1rem', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '0.75rem' }}>
              <input
                type="checkbox"
                name="depositRequired"
                checked={formData.depositRequired}
                onChange={handleChange}
                style={{ marginRight: '0.5rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28' }}>
                Require Deposit
              </span>
            </label>
            {formData.depositRequired && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1B1E28',
                  marginBottom: '0.5rem'
                }}>
                  Deposit Percentage (%)
                </label>
                <input
                  type="number"
                  name="depositPercentage"
                  value={formData.depositPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E8EAED',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1A73E8'}
                  onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
                />
              </div>
            )}
          </div>

          {/* Assign Staff */}
          {staff.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1B1E28',
                marginBottom: '0.5rem'
              }}>
                Assign Staff
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {staff.map(member => (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => handleStaffToggle(member._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: formData.staffIds.includes(member._id) ? '2px solid #1A73E8' : '1px solid #E8EAED',
                      borderRadius: '20px',
                      backgroundColor: formData.staffIds.includes(member._id) ? '#E8F0FE' : 'white',
                      color: formData.staffIds.includes(member._id) ? '#1A73E8' : '#5F6368',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {member.fullName || `${member.firstName} ${member.lastName}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ marginRight: '0.5rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28' }}>
                Service is active and bookable
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #E8EAED',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#5F6368',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading ? '#B0BEC5' : '#1A73E8',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
