import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ErrorBoundary from '../components/SharedComponents/ErrorBoundary';
import '../styles/publicBooking.css';

function PublicBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [allowCustomerChooseStaff, setAllowCustomerChooseStaff] = useState(false);
  
  // Multi-step form state
  const [step, setStep] = useState(1); // 1: service, 2: staff (conditional), 3: date/time, 4: details, 5: confirmation
  
  // Form state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
    loadBookingPage();
  }, [slug]);

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedService, selectedStaff]);

  const loadBookingPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/public/booking/${slug}`);
      setBusinessData(response.data.data);
    } catch (err) {
      console.error('Error loading booking page:', err);
      const errorCode = err.response?.data?.error?.code;
      const errorMessage = err.response?.data?.error?.message || 'Failed to load booking page';

      if (errorCode === 'SALON_NOT_FOUND') {
        setError('Booking link not active or does not exist.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStaffForService = async (serviceId) => {
    try {
      const response = await axios.get(`/public/staff/${slug}?serviceId=${serviceId}`);
      const staffData = response.data.data.staff || [];
      setStaff(staffData);
      
      // Always allow customer to choose staff (required for new system)
      setAllowCustomerChooseStaff(staffData.length > 0);
      
      return staffData.length > 0;
    } catch (err) {
      console.error('Error loading staff:', err);
      setStaff([]);
      setAllowCustomerChooseStaff(false);
      return false;
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedService || !selectedStaff) return;

    try {
      setLoadingSlots(true);
      const params = new URLSearchParams({
        date: selectedDate,
        serviceId: selectedService._id,
        staffId: selectedStaff, // Staff is now required
      });

      const response = await axios.get(`/public/availability/${slug}?${params.toString()}`);
      setAvailableSlots(response.data.data.slots || []);
    } catch (err) {
      console.error('Error loading availability:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleServiceSelect = async (service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    
    // Load staff for this service
    const hasStaff = await loadStaffForService(service._id);
    
    // Always require staff selection in new system
    if (hasStaff) {
      setStep(2);
    } else {
      // Show error if no staff available
      alert('No staff available for this service. Please contact the salon.');
    }
  };

  const handleStaffSelect = (staffMember) => {
    // Store staff ID (required for new system)
    setSelectedStaff(staffMember._id);
    setSelectedDate('');
    setSelectedTime('');
    setStep(3);
  };

  const handleDateTimeSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    setStep(4);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !customerPhone) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        serviceId: selectedService._id,
        staffId: selectedStaff || 'any',
        date: selectedDate,
        time: selectedTime,
        customerName,
        customerEmail,
        customerPhone,
        customerNotes: notes,
      };

      const response = await axios.post(`/public/booking/${slug}`, bookingData);
      
      setConfirmationData({
        bookingId: response.data.data.bookingId,
        businessName: businessData.name,
        service: response.data.data.service,
        staff: response.data.data.staff,
        date: response.data.data.appointmentDate,
        startTime: response.data.data.startTime,
        endTime: response.data.data.endTime,
        customerName,
        customerEmail,
        status: response.data.data.status,
      });
      
      setStep(5);
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMessage = err.response?.data?.error?.message || 'Failed to create booking';
      setError(errorMessage);
      alert(`Booking failed: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToProfile = () => {
    navigate(`/profile/${slug}`);
  };

  const handleNewBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setNotes('');
    setConfirmationData(null);
    setError(null);
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="public-booking-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !businessData) {
    return (
      <div className="public-booking-container">
        <div className="error-page">
          <div className="error-icon">😕</div>
          <h1>Booking Not Available</h1>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!businessData) {
    return null;
  }

  return (
    <div className="public-booking-container">
      {/* Header */}
      <div className="booking-header">
        <div className="booking-header-content">
          {businessData.logo && (
            <img src={businessData.logo} alt={businessData.name} className="business-logo" />
          )}
          <div>
            <h1>{businessData.name}</h1>
            <p>Book Your Appointment</p>
          </div>
        </div>
        <button className="btn-back" onClick={handleBackToProfile}>
          ← Back to Profile
        </button>
      </div>

      {/* Progress Indicator */}
      {step < 5 && (
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Service</div>
          {allowCustomerChooseStaff && staff.length > 0 && (
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Staff</div>
          )}
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            {allowCustomerChooseStaff && staff.length > 0 ? '3' : '2'}. Date & Time
          </div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
            {allowCustomerChooseStaff && staff.length > 0 ? '4' : '3'}. Your Details
          </div>
        </div>
      )}

      {/* Content */}
      <div className="booking-content">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="booking-step">
            <h2>Select a Service</h2>
            <div className="services-list">
              {businessData.services && businessData.services.length > 0 ? (
                businessData.services.map((service) => (
                  <div
                    key={service._id}
                    className="service-option"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="service-info">
                      <h3>{service.name}</h3>
                      <div className="service-meta">
                        {service.duration && <span>⏱️ {service.duration} min</span>}
                        {service.price && <span className="price">${service.price}</span>}
                      </div>
                    </div>
                    <button className="btn btn-select">Select</button>
                  </div>
                ))
              ) : (
                <p className="no-services">No services available at this time.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Staff Selection (Required) */}
        {step === 2 && allowCustomerChooseStaff && (
          <div className="booking-step">
            <div className="selected-service-banner">
              <strong>Selected Service:</strong> {selectedService.name}
              <button className="btn-change" onClick={() => setStep(1)}>Change</button>
            </div>
            
            <h2>Choose Your Stylist</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Select a staff member to see available times
            </p>
            
            <div className="staff-selection">
              {/* Staff Members */}
              {staff.map((staffMember) => (
                <div
                  key={staffMember._id}
                  className="staff-card"
                  onClick={() => handleStaffSelect(staffMember)}
                >
                  <div className="staff-photo">
                    {staffMember.photoUrl ? (
                      <img src={staffMember.photoUrl} alt={staffMember.name} />
                    ) : (
                      <div className="staff-avatar-placeholder">
                        {staffMember.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="staff-info">
                    <h3>{staffMember.name}</h3>
                    {staffMember.role && <p className="staff-role">{staffMember.role}</p>}
                  </div>
                  <button className="btn btn-select">Select</button>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {step === 3 && (
          <div className="booking-step">
            <div className="selected-service-banner">
              <strong>Service:</strong> {selectedService.name}
              {allowCustomerChooseStaff && selectedStaff && (
                <>
                  <span className="separator">•</span>
                  <strong>Staff:</strong> {
                    selectedStaff === 'any' 
                      ? 'Any Available' 
                      : staff.find(s => s._id === selectedStaff)?.name || 'Selected'
                  }
                </>
              )}
              <button className="btn-change" onClick={() => setStep(1)}>Change</button>
            </div>
            
            <h2>Choose Date & Time</h2>
            
            <div className="datetime-form">
              <div className="form-group">
                <label htmlFor="date">Preferred Date</label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {selectedDate && (
                <div className="form-group">
                  <label>Available Time Slots</label>
                  {loadingSlots ? (
                    <div className="loading-slots">
                      <div className="spinner-small"></div>
                      <span>Loading available times...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="time-slots-grid">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="no-slots">No available time slots for this date. Please select another date.</p>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setStep(allowCustomerChooseStaff && staff.length > 0 ? 2 : 1)}
                >
                  Back
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleDateTimeSubmit}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Customer Details */}
        {step === 4 && (
          <div className="booking-step">
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <p><strong>Service:</strong> {selectedService.name}</p>
              {allowCustomerChooseStaff && selectedStaff && (
                <p>
                  <strong>Staff:</strong> {
                    selectedStaff === 'any' 
                      ? 'Any Available' 
                      : staff.find(s => s._id === selectedStaff)?.name || 'Selected'
                  }
                </p>
              )}
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> {formatTime(selectedTime)}</p>
              {selectedService.duration && (
                <p><strong>Duration:</strong> {selectedService.duration} minutes</p>
              )}
              {selectedService.price && <p><strong>Price:</strong> ${selectedService.price}</p>}
            </div>

            <h2>Your Information</h2>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="555-123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Special Requests (Optional)</label>
                <textarea
                  id="notes"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or preferences..."
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(3)}
                  disabled={submitting}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && confirmationData && (
          <div className="booking-step confirmation-step">
            <div className="success-icon">✅</div>
            <h2>Booking Confirmed!</h2>
            <p>Your appointment has been successfully booked.</p>

            <div className="confirmation-details">
              <h3>Booking Details</h3>
              <div className="detail-row">
                <span>Booking ID:</span>
                <strong>{confirmationData.bookingId}</strong>
              </div>
              <div className="detail-row">
                <span>Business:</span>
                <strong>{confirmationData.businessName}</strong>
              </div>
              <div className="detail-row">
                <span>Service:</span>
                <strong>{confirmationData.service}</strong>
              </div>
              {confirmationData.staff && (
                <div className="detail-row">
                  <span>Staff:</span>
                  <strong>{confirmationData.staff}</strong>
                </div>
              )}
              <div className="detail-row">
                <span>Date:</span>
                <strong>{new Date(confirmationData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
              <div className="detail-row">
                <span>Time:</span>
                <strong>{formatTime(confirmationData.startTime)} - {formatTime(confirmationData.endTime)}</strong>
              </div>
              <div className="detail-row">
                <span>Name:</span>
                <strong>{confirmationData.customerName}</strong>
              </div>
              <div className="detail-row">
                <span>Email:</span>
                <strong>{confirmationData.customerEmail}</strong>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <strong className="status-badge">{confirmationData.status.toUpperCase()}</strong>
              </div>
            </div>

            <p className="confirmation-note">
              📧 A confirmation email has been sent to {confirmationData.customerEmail}
            </p>

            <div className="confirmation-actions">
              <button className="btn btn-secondary" onClick={handleBackToProfile}>
                Back to Profile
              </button>
              <button className="btn btn-primary" onClick={handleNewBooking}>
                Book Another Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap with ErrorBoundary for graceful error handling
export default function PublicBookingWithErrorBoundary(props) {
  return (
    <ErrorBoundary>
      <PublicBooking {...props} />
    </ErrorBoundary>
  );
}

