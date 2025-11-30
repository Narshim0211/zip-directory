import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './BookingModal.css';

/**
 * BookingModal - Multi-step Inline Booking Flow
 *
 * World-class booking experience inspired by Booksy/Fresha/Square.
 * Stays within the business profile page for seamless UX.
 *
 * Steps:
 * 1. Service Selection (can be pre-selected)
 * 2. Staff Selection (if multiple staff available)
 * 3. Date & Time Selection
 * 4. Contact Details
 * 5. Confirmation & Success
 */

const STEPS = {
  SERVICE: 1,
  STAFF: 2,
  DATETIME: 3,
  DETAILS: 4,
  CONFIRM: 5,
  SUCCESS: 6,
};

const BookingModal = ({
  isOpen,
  onClose,
  business,
  preSelectedService = null
}) => {
  const { user } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(STEPS.SERVICE);

  // Data states
  const [services, setServices] = useState([]);
  const [staffList, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selection states
  const [selectedService, setSelectedService] = useState(preSelectedService);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Customer details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Generate dates for next 14 days
  const getAvailableDates = useCallback(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Fetch services when modal opens
  useEffect(() => {
    if (isOpen && business?.bookingSlug) {
      fetchServices();
    }
  }, [isOpen, business?.bookingSlug]);

  // Pre-select service if provided
  useEffect(() => {
    if (preSelectedService) {
      setSelectedService(preSelectedService);
      setCurrentStep(STEPS.STAFF);
    }
  }, [preSelectedService]);

  // Fetch staff when service is selected
  useEffect(() => {
    if (selectedService && business?.bookingSlug) {
      fetchStaff();
    }
  }, [selectedService, business?.bookingSlug]);

  // Fetch availability when staff and date are selected
  useEffect(() => {
    if (selectedService && selectedDate && business?.bookingSlug) {
      fetchAvailability();
    }
  }, [selectedService, selectedStaff, selectedDate, business?.bookingSlug]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setCurrentStep(preSelectedService ? STEPS.STAFF : STEPS.SERVICE);
    if (!preSelectedService) setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setError(null);
    setBookingResult(null);
    setAvailableSlots([]);
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try booking microservice first, fallback to business services
      const response = await api.get(`/public/booking/${business.bookingSlug}`);
      setServices(response.data?.services || business.services || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      // Fallback to embedded services
      setServices(business.services || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/public/staff/${business.bookingSlug}?serviceId=${selectedService._id || selectedService.id}`
      );
      const staffData = response.data?.staff || [];
      setStaff(staffData);

      // Auto-select if only one staff member
      if (staffData.length === 1) {
        setSelectedStaff(staffData[0]);
      }
      // Skip staff step if no staff or only one
      if (staffData.length <= 1 && currentStep === STEPS.STAFF) {
        setCurrentStep(STEPS.DATETIME);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setStaff([]);
      // Continue without staff selection
      if (currentStep === STEPS.STAFF) {
        setCurrentStep(STEPS.DATETIME);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        serviceId: selectedService._id || selectedService.id,
        date: selectedDate,
      });
      if (selectedStaff) {
        params.append('staffId', selectedStaff._id || selectedStaff.id);
      }

      const response = await api.get(
        `/public/availability/${business.bookingSlug}?${params.toString()}`
      );

      setAvailableSlots(response.data?.slots || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setAvailableSlots([]);
      // Generate mock slots for demo if service fails
      generateMockSlots();
    } finally {
      setLoading(false);
    }
  };

  // Generate mock time slots for demo/testing
  const generateMockSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    setAvailableSlots(slots);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    setCurrentStep(STEPS.STAFF);
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setCurrentStep(STEPS.DATETIME);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(STEPS.DETAILS);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    setCurrentStep(STEPS.CONFIRM);
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        serviceId: selectedService._id || selectedService.id,
        staffId: selectedStaff?._id || selectedStaff?.id || null,
        date: selectedDate,
        time: selectedTime,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        notes: notes.trim(),
      };

      const response = await api.post(
        `/public/booking/${business.bookingSlug}`,
        bookingData
      );

      setBookingResult(response.data);
      setCurrentStep(STEPS.SUCCESS);
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-modal__header">
          <div className="booking-modal__header-content">
            <h2>Book Appointment</h2>
            <p>{business?.name}</p>
          </div>
          <button className="booking-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        {currentStep < STEPS.SUCCESS && (
          <div className="booking-modal__progress">
            {['Service', 'Staff', 'Date & Time', 'Details', 'Confirm'].map((label, idx) => (
              <div
                key={label}
                className={`booking-modal__step ${currentStep > idx + 1 ? 'completed' : ''} ${currentStep === idx + 1 ? 'active' : ''}`}
              >
                <span className="booking-modal__step-num">{idx + 1}</span>
                <span className="booking-modal__step-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="booking-modal__error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Content Area */}
        <div className="booking-modal__content">
          {/* Step 1: Service Selection */}
          {currentStep === STEPS.SERVICE && (
            <div className="booking-step booking-step--services">
              <h3>Select a Service</h3>
              {loading ? (
                <div className="booking-loading">Loading services...</div>
              ) : services.length === 0 ? (
                <div className="booking-empty">
                  <p>No services available for booking at this time.</p>
                </div>
              ) : (
                <div className="booking-services-list">
                  {services.map((service) => (
                    <div
                      key={service._id || service.id}
                      className={`booking-service-card ${selectedService?._id === service._id ? 'selected' : ''}`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="booking-service-card__info">
                        <h4>{service.name}</h4>
                        {service.description && (
                          <p className="booking-service-card__desc">{service.description}</p>
                        )}
                        <div className="booking-service-card__meta">
                          <span className="booking-service-card__duration">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {formatDuration(service.duration || 30)}
                          </span>
                        </div>
                      </div>
                      <div className="booking-service-card__price">
                        {formatPrice(service.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Staff Selection */}
          {currentStep === STEPS.STAFF && (
            <div className="booking-step booking-step--staff">
              <h3>Choose a Stylist</h3>
              <p className="booking-step__subtitle">Select your preferred professional</p>

              {loading ? (
                <div className="booking-loading">Loading stylists...</div>
              ) : staffList.length === 0 ? (
                <div className="booking-staff-list">
                  <div
                    className="booking-staff-card selected"
                    onClick={() => handleStaffSelect(null)}
                  >
                    <div className="booking-staff-card__avatar">
                      <span>🎯</span>
                    </div>
                    <div className="booking-staff-card__info">
                      <h4>Any Available</h4>
                      <p>First available professional</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="booking-staff-list">
                  <div
                    className={`booking-staff-card ${!selectedStaff ? 'selected' : ''}`}
                    onClick={() => handleStaffSelect(null)}
                  >
                    <div className="booking-staff-card__avatar">
                      <span>🎯</span>
                    </div>
                    <div className="booking-staff-card__info">
                      <h4>Any Available</h4>
                      <p>First available professional</p>
                    </div>
                  </div>
                  {staffList.map((staff) => (
                    <div
                      key={staff._id || staff.id}
                      className={`booking-staff-card ${selectedStaff?._id === staff._id ? 'selected' : ''}`}
                      onClick={() => handleStaffSelect(staff)}
                    >
                      <div className="booking-staff-card__avatar">
                        {staff.avatarUrl ? (
                          <img src={staff.avatarUrl} alt={staff.firstName} />
                        ) : (
                          <span>{(staff.firstName || staff.name || '?')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="booking-staff-card__info">
                        <h4>{staff.firstName} {staff.lastName || ''}</h4>
                        {staff.role && <p>{staff.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="booking-btn booking-btn--secondary"
                onClick={() => setCurrentStep(STEPS.SERVICE)}
              >
                ← Back to Services
              </button>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === STEPS.DATETIME && (
            <div className="booking-step booking-step--datetime">
              <h3>Select Date & Time</h3>

              {/* Date Selection */}
              <div className="booking-dates">
                <h4>Choose a Date</h4>
                <div className="booking-dates__grid">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date}
                      className={`booking-date-btn ${selectedDate === date ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="booking-times">
                  <h4>Choose a Time</h4>
                  {loading ? (
                    <div className="booking-loading">Loading available times...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="booking-empty">
                      <p>No available slots for this date. Please try another date.</p>
                    </div>
                  ) : (
                    <div className="booking-times__grid">
                      {availableSlots.map((slot) => {
                        const time = typeof slot === 'string' ? slot : slot.time;
                        return (
                          <button
                            key={time}
                            className={`booking-time-btn ${selectedTime === time ? 'selected' : ''}`}
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                className="booking-btn booking-btn--secondary"
                onClick={() => setCurrentStep(staffList.length > 0 ? STEPS.STAFF : STEPS.SERVICE)}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 4: Customer Details */}
          {currentStep === STEPS.DETAILS && (
            <div className="booking-step booking-step--details">
              <h3>Your Details</h3>
              <form onSubmit={handleDetailsSubmit}>
                <div className="booking-form-group">
                  <label htmlFor="customerName">Full Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="booking-form-group">
                  <label htmlFor="customerEmail">Email *</label>
                  <input
                    type="email"
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="booking-form-group">
                  <label htmlFor="customerPhone">Phone Number *</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="booking-form-group">
                  <label htmlFor="notes">Notes (optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
                <div className="booking-form-actions">
                  <button
                    type="button"
                    className="booking-btn booking-btn--secondary"
                    onClick={() => setCurrentStep(STEPS.DATETIME)}
                  >
                    ← Back
                  </button>
                  <button type="submit" className="booking-btn booking-btn--primary">
                    Review Booking →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === STEPS.CONFIRM && (
            <div className="booking-step booking-step--confirm">
              <h3>Confirm Your Booking</h3>

              <div className="booking-summary">
                <div className="booking-summary__section">
                  <h4>Service</h4>
                  <p>{selectedService?.name}</p>
                  <span className="booking-summary__price">{formatPrice(selectedService?.price)}</span>
                </div>

                {selectedStaff && (
                  <div className="booking-summary__section">
                    <h4>Stylist</h4>
                    <p>{selectedStaff.firstName} {selectedStaff.lastName || ''}</p>
                  </div>
                )}

                <div className="booking-summary__section">
                  <h4>Date & Time</h4>
                  <p>{formatDate(selectedDate)} at {selectedTime}</p>
                </div>

                <div className="booking-summary__section">
                  <h4>Contact</h4>
                  <p>{customerName}</p>
                  <p>{customerEmail}</p>
                  <p>{customerPhone}</p>
                </div>

                {notes && (
                  <div className="booking-summary__section">
                    <h4>Notes</h4>
                    <p>{notes}</p>
                  </div>
                )}
              </div>

              <div className="booking-form-actions">
                <button
                  className="booking-btn booking-btn--secondary"
                  onClick={() => setCurrentStep(STEPS.DETAILS)}
                  disabled={loading}
                >
                  ← Edit Details
                </button>
                <button
                  className="booking-btn booking-btn--primary"
                  onClick={handleConfirmBooking}
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {currentStep === STEPS.SUCCESS && (
            <div className="booking-step booking-step--success">
              <div className="booking-success">
                <div className="booking-success__icon">✓</div>
                <h3>Booking Confirmed!</h3>
                <p>Your appointment has been successfully booked.</p>

                <div className="booking-success__details">
                  <p><strong>{selectedService?.name}</strong></p>
                  <p>{formatDate(selectedDate)} at {selectedTime}</p>
                  <p>{business?.name}</p>
                </div>

                <p className="booking-success__note">
                  A confirmation email has been sent to {customerEmail}
                </p>

                <button
                  className="booking-btn booking-btn--primary"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
