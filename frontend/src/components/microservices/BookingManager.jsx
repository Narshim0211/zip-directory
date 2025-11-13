import React, { useState, useEffect } from 'react';
import bookingService from '../../api/bookingService';

/**
 * Booking Manager Component
 * Demonstrates Booking Microservice Integration
 * 
 * Features:
 * - View all bookings
 * - Create new bookings
 * - Update booking status
 * - Check availability
 */
const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    loadBookings();
    loadServices();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getMyBookings();
      
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await bookingService.getMyServices();
      
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const bookingData = {
        service: formData.serviceId,
        date: dateTime.toISOString(),
        notes: formData.notes
      };
      
      const response = await bookingService.createBooking(bookingData);
      
      if (response.success) {
        setSuccess('Booking created successfully!');
        setShowForm(false);
        setFormData({
          serviceId: '',
          date: '',
          time: '',
          notes: ''
        });
        loadBookings();
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await bookingService.updateBookingStatus(bookingId, status);
      
      if (response.success) {
        setSuccess(`Booking ${status} successfully!`);
        loadBookings();
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="booking-manager p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ New Booking'}
        </button>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Create Booking Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Booking</h2>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requests or notes..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || services.length === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
        
        {loading && <div className="text-center py-4">Loading bookings...</div>}
        
        {!loading && bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No bookings yet. Create your first booking!</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {booking.service?.name || 'Service N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.date)}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-medium">${booking.service?.price || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">{booking.service?.duration || 'N/A'} min</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-medium">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Business</p>
                    <p className="font-medium">{booking.business?.name || 'N/A'}</p>
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {booking.notes}
                    </p>
                  </div>
                )}
                
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                      disabled={loading}
                      className="bg-green-600 text-white text-sm py-1 px-3 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                      disabled={loading}
                      className="bg-red-600 text-white text-sm py-1 px-3 rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {booking.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                      disabled={loading}
                      className="bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'no-show')}
                      disabled={loading}
                      className="bg-gray-600 text-white text-sm py-1 px-3 rounded hover:bg-gray-700 disabled:bg-gray-400 transition"
                    >
                      No Show
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManager;
