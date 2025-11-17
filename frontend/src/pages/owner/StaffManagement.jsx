import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from '../../api/axios';

/**
 * Staff Management Page for Owner Dashboard
 * Manage staff members, schedules, and service assignments
 */
const StaffManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [allowCustomerChooseStaff, setAllowCustomerChooseStaff] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    photoUrl: '',
    serviceIds: [],
    weeklySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  });

  useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'admin')) {
      loadData();
    }
  }, [user]);

  // Access control
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'owner' && user.role !== 'admin') {
    return (
      <div style={styles.accessDenied}>
        <div style={styles.accessDeniedBox}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.5rem' }}>
            Access Denied
          </h1>
          <p style={{ color: '#5F6368', marginBottom: '1rem' }}>
            You don't have permission to access staff management.
          </p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, businessRes] = await Promise.all([
        axios.get('/owner/staff'),
        axios.get('/owner/business/profile'),
      ]);

      setStaff(staffRes.data.data.staff || []);
      setAllowCustomerChooseStaff(staffRes.data.data.allowCustomerChooseStaff || false);
      setServices(businessRes.data.data.services || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        role: staffMember.role || '',
        photoUrl: staffMember.photoUrl || '',
        serviceIds: staffMember.serviceIds || [],
        weeklySchedule: staffMember.weeklySchedule || getDefaultSchedule(),
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: '',
        photoUrl: '',
        serviceIds: [],
        weeklySchedule: getDefaultSchedule(),
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      role: '',
      photoUrl: '',
      serviceIds: [],
      weeklySchedule: getDefaultSchedule(),
    });
  };

  const getDefaultSchedule = () => ({
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [],
    sunday: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Staff name is required');
      return;
    }

    try {
      setLoading(true);
      
      if (editingStaff) {
        await axios.patch(`/owner/staff/${editingStaff._id}`, formData);
        setSuccess('Staff member updated successfully');
      } else {
        await axios.post('/owner/staff', formData);
        setSuccess('Staff member added successfully');
      }

      await loadData();
      handleCloseModal();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save staff:', err);
      setError(err.response?.data?.message || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/owner/staff/${staffId}`);
      setSuccess('Staff member removed successfully');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete staff:', err);
      setError(err.response?.data?.message || 'Failed to remove staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStaffSelection = async () => {
    try {
      const newValue = !allowCustomerChooseStaff;
      await axios.patch('/owner/staff/settings', {
        allowCustomerChooseStaff: newValue,
      });
      setAllowCustomerChooseStaff(newValue);
      setSuccess('Staff selection setting updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleScheduleChange = (day, index, field, value) => {
    setFormData(prev => {
      const newSchedule = { ...prev.weeklySchedule };
      if (!newSchedule[day]) newSchedule[day] = [];
      if (!newSchedule[day][index]) newSchedule[day][index] = {};
      newSchedule[day][index][field] = value;
      return { ...prev, weeklySchedule: newSchedule };
    });
  };

  const handleAddTimeSlot = (day) => {
    setFormData(prev => {
      const newSchedule = { ...prev.weeklySchedule };
      if (!newSchedule[day]) newSchedule[day] = [];
      newSchedule[day].push({ start: '09:00', end: '17:00' });
      return { ...prev, weeklySchedule: newSchedule };
    });
  };

  const handleRemoveTimeSlot = (day, index) => {
    setFormData(prev => {
      const newSchedule = { ...prev.weeklySchedule };
      newSchedule[day] = newSchedule[day].filter((_, i) => i !== index);
      return { ...prev, weeklySchedule: newSchedule };
    });
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const serviceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds };
    });
  };

  if (loading && staff.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: '#5F6368' }}>Loading staff...</p>
      </div>
    );
  }

  const activeStaff = staff.filter(s => s.isActive);
  const inactiveStaff = staff.filter(s => !s.isActive);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Staff Management</h1>
          <p style={styles.subtitle}>
            Manage your team members, schedules, and service assignments
          </p>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.addButton}>
          <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>+</span>
          Add Staff Member
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div style={styles.errorBanner}>
          <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>⚠️</span>
          {error}
          <button onClick={() => setError(null)} style={styles.closeBanner}>×</button>
        </div>
      )}

      {success && (
        <div style={styles.successBanner}>
          <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>✓</span>
          {success}
          <button onClick={() => setSuccess(null)} style={styles.closeBanner}>×</button>
        </div>
      )}

      {/* Settings Card */}
      <div style={styles.settingsCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.25rem' }}>
              Customer Staff Selection
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#5F6368' }}>
              Allow customers to choose their preferred staff member when booking
            </p>
          </div>
          <label style={styles.toggleContainer}>
            <input
              type="checkbox"
              checked={allowCustomerChooseStaff}
              onChange={handleToggleStaffSelection}
              style={{ display: 'none' }}
            />
            <div style={{
              ...styles.toggle,
              backgroundColor: allowCustomerChooseStaff ? '#4285F4' : '#E8EAED',
            }}>
              <div style={{
                ...styles.toggleCircle,
                transform: allowCustomerChooseStaff ? 'translateX(20px)' : 'translateX(0)',
              }}></div>
            </div>
          </label>
        </div>
      </div>

      {/* Staff Grid */}
      {activeStaff.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.5rem' }}>
            No Staff Members Yet
          </h3>
          <p style={{ color: '#5F6368', marginBottom: '1.5rem' }}>
            Add your first team member to start managing schedules and bookings
          </p>
          <button onClick={() => handleOpenModal()} style={styles.addButton}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>+</span>
            Add Your First Staff Member
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {activeStaff.map((member) => (
            <div key={member._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <img
                  src={member.photoUrl || 'https://i.pravatar.cc/300'}
                  alt={member.name}
                  style={styles.avatar}
                  onError={(e) => {
                    e.target.src = 'https://i.pravatar.cc/300';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>{member.name}</h3>
                  {member.role && (
                    <p style={styles.cardRole}>{member.role}</p>
                  )}
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoSection}>
                  <p style={styles.infoLabel}>Services</p>
                  {member.serviceIds && member.serviceIds.length > 0 ? (
                    <div style={styles.serviceTagsContainer}>
                      {member.serviceIds.slice(0, 3).map((serviceId) => {
                        const service = services.find(s => s._id === serviceId);
                        return service ? (
                          <span key={serviceId} style={styles.serviceTag}>
                            {service.name}
                          </span>
                        ) : null;
                      })}
                      {member.serviceIds.length > 3 && (
                        <span style={{ ...styles.serviceTag, backgroundColor: '#E8EAED', color: '#5F6368' }}>
                          +{member.serviceIds.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: '#9AA0A6' }}>No services assigned</p>
                  )}
                </div>

                <div style={styles.infoSection}>
                  <p style={styles.infoLabel}>Schedule</p>
                  <p style={{ fontSize: '0.875rem', color: '#5F6368' }}>
                    {getScheduleSummary(member.weeklySchedule)}
                  </p>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button
                  onClick={() => handleOpenModal(member)}
                  style={styles.editButton}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  style={styles.deleteButton}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Modal */}
      {showModal && (
        <StaffModal
          staff={editingStaff}
          services={services}
          formData={formData}
          setFormData={setFormData}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onScheduleChange={handleScheduleChange}
          onAddTimeSlot={handleAddTimeSlot}
          onRemoveTimeSlot={handleRemoveTimeSlot}
          onServiceToggle={handleServiceToggle}
          loading={loading}
        />
      )}
    </div>
  );
};

// Helper function
const getScheduleSummary = (schedule) => {
  if (!schedule) return 'No schedule set';
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const workingDays = days.filter(day => schedule[day] && schedule[day].length > 0);
  
  if (workingDays.length === 0) return 'No working days';
  if (workingDays.length === 7) return 'Available 7 days/week';
  if (workingDays.length >= 5) return `Available ${workingDays.length} days/week`;
  
  return `${workingDays.map(d => d.slice(0, 3).toUpperCase()).join(', ')}`;
};

// Styles
const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#F7F9FD',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1B1E28',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#5F6368',
  },
  addButton: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
  },
  settingsCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  toggleContainer: {
    cursor: 'pointer',
  },
  toggle: {
    width: '48px',
    height: '28px',
    borderRadius: '14px',
    position: 'relative',
    transition: 'background-color 0.3s',
  },
  toggleCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'white',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'transform 0.3s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E8EAED',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E8EAED',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1B1E28',
    marginBottom: '0.25rem',
  },
  cardRole: {
    fontSize: '0.875rem',
    color: '#5F6368',
  },
  cardBody: {
    marginBottom: '1rem',
  },
  infoSection: {
    marginBottom: '1rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  serviceTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  serviceTag: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#E8F0FE',
    color: '#1967D2',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  cardActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  editButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#E8F0FE',
    color: '#1967D2',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#FCE8E6',
    color: '#D93025',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '4rem 2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F7F9FD',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #E8EAED',
    borderTop: '4px solid #4285F4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBanner: {
    backgroundColor: '#FCE8E6',
    color: '#D93025',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(217, 48, 37, 0.1)',
  },
  successBanner: {
    backgroundColor: '#E6F4EA',
    color: '#137333',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(19, 115, 51, 0.1)',
  },
  closeBanner: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.7,
  },
  accessDenied: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F7F9FD',
  },
  accessDeniedBox: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0px 2px 12px rgba(0,0,0,0.06)',
    maxWidth: '28rem',
  },
};

// Staff Modal Component
const StaffModal = ({
  staff,
  services,
  formData,
  setFormData,
  onClose,
  onSubmit,
  onScheduleChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onServiceToggle,
  loading,
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button onClick={onClose} style={modalStyles.closeButton}>×</button>
        </div>

        <form onSubmit={onSubmit} style={modalStyles.form}>
          {/* Basic Info */}
          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>Basic Information</h3>
            
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={modalStyles.input}
                placeholder="e.g., Sarah Johnson"
                required
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Role/Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                style={modalStyles.input}
                placeholder="e.g., Senior Stylist"
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Photo URL</label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                style={modalStyles.input}
                placeholder="https://example.com/photo.jpg"
              />
              {formData.photoUrl && (
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  style={modalStyles.photoPreview}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          {/* Services */}
          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>Services</h3>
            <p style={modalStyles.sectionDesc}>Select which services this staff member can perform</p>
            
            {services.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#9AA0A6', fontStyle: 'italic' }}>
                No services available. Please add services first.
              </p>
            ) : (
              <div style={modalStyles.servicesGrid}>
                {services.map((service) => (
                  <label key={service._id} style={modalStyles.serviceCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.serviceIds.includes(service._id)}
                      onChange={() => onServiceToggle(service._id)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span>{service.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Schedule */}
          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>Weekly Schedule</h3>
            <p style={modalStyles.sectionDesc}>Set working hours for each day</p>
            
            {days.map((day) => (
              <div key={day} style={modalStyles.scheduleDay}>
                <div style={modalStyles.dayHeader}>
                  <span style={modalStyles.dayName}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddTimeSlot(day)}
                    style={modalStyles.addSlotButton}
                  >
                    + Add Time Slot
                  </button>
                </div>

                {(!formData.weeklySchedule[day] || formData.weeklySchedule[day].length === 0) ? (
                  <p style={modalStyles.noSlots}>Closed</p>
                ) : (
                  formData.weeklySchedule[day].map((slot, index) => (
                    <div key={index} style={modalStyles.timeSlot}>
                      <input
                        type="time"
                        value={slot.start || '09:00'}
                        onChange={(e) => onScheduleChange(day, index, 'start', e.target.value)}
                        style={modalStyles.timeInput}
                      />
                      <span style={{ margin: '0 0.5rem', color: '#5F6368' }}>to</span>
                      <input
                        type="time"
                        value={slot.end || '17:00'}
                        onChange={(e) => onScheduleChange(day, index, 'end', e.target.value)}
                        style={modalStyles.timeInput}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveTimeSlot(day, index)}
                        style={modalStyles.removeSlotButton}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={modalStyles.actions}>
            <button type="button" onClick={onClose} style={modalStyles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={modalStyles.submitButton} disabled={loading}>
              {loading ? 'Saving...' : (staff ? 'Update Staff Member' : 'Add Staff Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
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
    padding: '1rem',
    overflowY: 'auto',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #E8EAED',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#1B1E28',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#5F6368',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  form: {
    padding: '1.5rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1B1E28',
    marginBottom: '0.5rem',
  },
  sectionDesc: {
    fontSize: '0.875rem',
    color: '#5F6368',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1B1E28',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #E8EAED',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  photoPreview: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginTop: '0.75rem',
    border: '3px solid #E8EAED',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  serviceCheckbox: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#F7F9FD',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s',
  },
  scheduleDay: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#F7F9FD',
    borderRadius: '8px',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  dayName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1B1E28',
    textTransform: 'capitalize',
  },
  addSlotButton: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#E8F0FE',
    color: '#1967D2',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  noSlots: {
    fontSize: '0.875rem',
    color: '#9AA0A6',
    fontStyle: 'italic',
  },
  timeSlot: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  timeInput: {
    padding: '0.5rem',
    border: '1px solid #E8EAED',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
  },
  removeSlotButton: {
    marginLeft: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#D93025',
    fontSize: '1.5rem',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #E8EAED',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#F7F9FD',
    color: '#5F6368',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
  },
};

export default StaffManagement;
