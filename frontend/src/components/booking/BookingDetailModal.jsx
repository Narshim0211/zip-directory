import React, { useState } from 'react';

const BookingDetailModal = ({ isOpen, onClose, booking, onStatusUpdate, onCancel, onReschedule }) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !booking) return null;

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time');
      return;
    }

    const newStartTime = new Date(`${newDate}T${newTime}`);
    await onReschedule(booking._id, newStartTime);
    setShowReschedule(false);
    setNewDate('');
    setNewTime('');
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    await onCancel(booking._id, cancelReason);
    setShowCancelConfirm(false);
    setCancelReason('');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#FFF4E6', color: '#E67E22' },
      confirmed: { bg: '#E6F4EA', color: '#0F9D58' },
      in_progress: { bg: '#E8F0FE', color: '#1A73E8' },
      completed: { bg: '#F0F0F0', color: '#5F6368' },
      cancelled: { bg: '#FEEAEA', color: '#D93025' },
      no_show: { bg: '#FFF3E0', color: '#F57C00' }
    };
    return colors[status] || colors.pending;
  };

  const statusColors = getStatusColor(booking.status);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E8EAED',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F7F9FD'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28' }}>
              Booking Details
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#5F6368', marginTop: '0.25rem' }}>
              {booking.bookingRef || `BK${booking._id?.slice(-8).toUpperCase()}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#5F6368',
              padding: '0.5rem',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Status Badge */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: statusColors.bg,
              color: statusColors.color,
              textTransform: 'uppercase'
            }}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>

          {/* Customer Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.75rem' }}>
              Customer Information
            </h3>
            <div style={{ backgroundColor: '#F7F9FD', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Name: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28' }}>{booking.customerName}</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Email: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28' }}>{booking.customerEmail}</span>
              </div>
              {booking.customerPhone && (
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Phone: </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28' }}>{booking.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service & Staff Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.75rem' }}>
              Service Details
            </h3>
            <div style={{ backgroundColor: '#F7F9FD', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Service: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28' }}>{booking.serviceName}</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Staff: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28' }}>{booking.staffName}</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Duration: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28' }}>{booking.duration} minutes</span>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Price: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F9D58' }}>${booking.servicePrice}</span>
              </div>
            </div>
          </div>

          {/* Booking Time */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.75rem' }}>
              Appointment Time
            </h3>
            <div style={{ backgroundColor: '#F7F9FD', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Date: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28' }}>
                  {new Date(booking.startTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Time: </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28' }}>
                  {new Date(booking.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {new Date(booking.endTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {booking.depositRequired && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.75rem' }}>
                Payment Information
              </h3>
              <div style={{ backgroundColor: '#F7F9FD', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Deposit Required: </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28' }}>${booking.depositAmount}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Deposit Status: </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: booking.depositPaid ? '#0F9D58' : '#E67E22'
                  }}>
                    {booking.depositPaid ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#5F6368' }}>Payment Status: </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B1E28', textTransform: 'capitalize' }}>
                    {booking.paymentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.75rem' }}>
                Notes
              </h3>
              <div style={{ backgroundColor: '#F7F9FD', borderRadius: '12px', padding: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#1B1E28', margin: 0 }}>{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Reschedule Section */}
          {showReschedule && (
            <div style={{ marginBottom: '1.5rem', backgroundColor: '#E8F0FE', borderRadius: '12px', padding: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>
                Reschedule Appointment
              </h3>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28', marginBottom: '0.25rem' }}>
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28', marginBottom: '0.25rem' }}>
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleReschedule}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#1A73E8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Reschedule
                </button>
                <button
                  onClick={() => {
                    setShowReschedule(false);
                    setNewDate('');
                    setNewTime('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#5F6368',
                    border: '1px solid #E8EAED',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cancel Confirmation */}
          {showCancelConfirm && (
            <div style={{ marginBottom: '1.5rem', backgroundColor: '#FEEAEA', borderRadius: '12px', padding: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#D93025', marginBottom: '1rem' }}>
                Cancel Appointment
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1B1E28', marginBottom: '0.25rem' }}>
                  Cancellation Reason (required)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#D93025',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#5F6368',
                    border: '1px solid #E8EAED',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Keep Booking
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {['pending', 'confirmed'].includes(booking.status) && !showReschedule && !showCancelConfirm && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E8EAED',
            backgroundColor: '#F7F9FD',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            {booking.status === 'pending' && (
              <button
                onClick={() => onStatusUpdate(booking._id, 'confirmed')}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#0F9D58',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✓ Confirm Booking
              </button>
            )}
            <button
              onClick={() => setShowReschedule(true)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1A73E8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📅 Reschedule
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#D93025',
                border: '1px solid #D93025',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ✕ Cancel Booking
            </button>
          </div>
        )}

        {booking.status === 'confirmed' && !showReschedule && !showCancelConfirm && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E8EAED',
            backgroundColor: '#F7F9FD',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => onStatusUpdate(booking._id, 'in_progress')}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1A73E8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ▶ Start Service
            </button>
            <button
              onClick={() => onStatusUpdate(booking._id, 'no_show')}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#F57C00',
                border: '1px solid #F57C00',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              No Show
            </button>
          </div>
        )}

        {booking.status === 'in_progress' && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E8EAED',
            backgroundColor: '#F7F9FD'
          }}>
            <button
              onClick={() => onStatusUpdate(booking._id, 'completed')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0F9D58',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✓ Complete Service
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default BookingDetailModal;
