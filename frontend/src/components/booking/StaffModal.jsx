import React, { useState, useEffect } from 'react';

/**
 * Staff Modal Component
 * For creating and editing staff members
 * Matches design spec with working hours configuration
 */
const StaffModal = ({ isOpen, onClose, onSave, staffMember = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'staff',
    specialties: [],
    isActive: true,
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '10:00', end: '15:00' },
      sunday: { enabled: false, start: '10:00', end: '15:00' },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [specialtyInput, setSpecialtyInput] = useState('');

  useEffect(() => {
    if (staffMember) {
      setFormData({
        firstName: staffMember.firstName || '',
        lastName: staffMember.lastName || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        role: staffMember.role || 'staff',
        specialties: staffMember.specialties || [],
        isActive: staffMember.isActive !== undefined ? staffMember.isActive : true,
        workingHours: staffMember.workingHours || formData.workingHours,
      });
    }
  }, [staffMember]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          enabled: !prev.workingHours[day].enabled
        }
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()]
      }));
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For new staff, we need to create a user account as well
      // This would typically be handled by the backend
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
        maxWidth: '700px',
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
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', margin: 0 }}>
            {staffMember ? 'Edit Staff Member' : 'Add New Staff Member'}
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

          {/* Basic Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>
              Basic Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1B1E28',
                  marginBottom: '0.5rem'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
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
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1B1E28',
                  marginBottom: '0.5rem'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!staffMember} // Can't change email for existing staff
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E8EAED',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    backgroundColor: staffMember ? '#F7F9FD' : 'white'
                  }}
                  onFocus={(e) => !staffMember && (e.target.style.borderColor = '#1A73E8')}
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
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
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

            {/* Specialties */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1B1E28',
                marginBottom: '0.5rem'
              }}>
                Specialties
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                  placeholder="e.g., Haircut, Coloring"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #E8EAED',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#E8F0FE',
                    color: '#1A73E8',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.specialties.map(specialty => (
                  <span
                    key={specialty}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#E8F0FE',
                      color: '#1A73E8',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(specialty)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1A73E8',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>
              Working Hours
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {days.map(day => (
                <div key={day} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 1fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: formData.workingHours[day].enabled ? '#F7F9FD' : '#FAFAFA',
                  borderRadius: '8px',
                  border: '1px solid #E8EAED'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.workingHours[day].enabled}
                      onChange={() => handleDayToggle(day)}
                      style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#1B1E28',
                      textTransform: 'capitalize'
                    }}>
                      {day}
                    </span>
                  </label>
                  <input
                    type="time"
                    value={formData.workingHours[day].start}
                    onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                    disabled={!formData.workingHours[day].enabled}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #E8EAED',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: formData.workingHours[day].enabled ? 'white' : '#FAFAFA'
                    }}
                  />
                  <input
                    type="time"
                    value={formData.workingHours[day].end}
                    onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                    disabled={!formData.workingHours[day].enabled}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #E8EAED',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: formData.workingHours[day].enabled ? 'white' : '#FAFAFA'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#5F6368', minWidth: '80px' }}>
                    {formData.workingHours[day].enabled ? 'Working' : 'Day Off'}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
                Staff member is active
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            paddingTop: '1rem',
            borderTop: '1px solid #E8EAED',
            marginTop: '1.5rem'
          }}>
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
              {loading ? 'Saving...' : staffMember ? 'Update Staff' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
