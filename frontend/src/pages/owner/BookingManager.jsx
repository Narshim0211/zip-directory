import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ErrorBoundary from '../../components/Shared/ErrorBoundary';
import bookingService from '../../api/bookingService';
import ServiceModal from '../../components/booking/ServiceModal';
import StaffModal from '../../components/booking/StaffModal';
import BookingDetailModal from '../../components/booking/BookingDetailModal';

/**
 * Booking Manager Page for Owner Dashboard
 * World-class UI matching design spec with full CRUD functionality
 */
const BookingManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Load data on mount (before any conditional returns)
  useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'admin')) {
      loadDashboardData();
    }
  }, [user]);

  // Strict role-based access control
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'owner' && user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F7F9FD' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', maxWidth: '28rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.5rem' }}>403 - Access Denied</h1>
          <p style={{ color: '#5F6368', marginBottom: '1rem' }}>
            You do not have permission to access this feature.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#5F6368', marginBottom: '1.5rem' }}>
            Booking Manager is only available to business owners.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{ backgroundColor: '#1A73E8', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, bookingsData, servicesData, staffData] = await Promise.all([
        bookingService.getBookingStats().catch(() => ({ data: {} })),
        bookingService.getOwnerBookings({ limit: 10 }).catch(() => ({ data: [] })),
        bookingService.getMyServices().catch(() => ({ data: [] })),
        bookingService.getOwnerStaff(user._id).catch(() => ({ data: [] })),
      ]);

      setStats(statsData.data || {});
      setBookings(bookingsData.data || []);
      setServices(servicesData.data || []);
      setStaff(staffData.data || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Service CRUD handlers
  const handleCreateService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleSaveService = async (serviceData) => {
    try {
      if (editingService) {
        await bookingService.updateService(editingService._id, serviceData);
      } else {
        await bookingService.createService(serviceData);
      }
      await loadDashboardData();
      setShowServiceModal(false);
      setEditingService(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await bookingService.deleteService(serviceId);
        await loadDashboardData();
      } catch (err) {
        alert(err.message || 'Failed to delete service');
      }
    }
  };

  // Staff CRUD handlers
  const handleCreateStaff = () => {
    setEditingStaff(null);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (staffData) => {
    try {
      if (editingStaff) {
        await bookingService.updateStaff(editingStaff._id, staffData);
      } else {
        await bookingService.createStaff({
          ...staffData,
          userId: user._id // This would need to be handled properly in production
        });
      }
      await loadDashboardData();
      setShowStaffModal(false);
      setEditingStaff(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        await bookingService.deactivateStaff(staffId);
        await loadDashboardData();
      } catch (err) {
        alert(err.message || 'Failed to deactivate staff');
      }
    }
  };

  // Booking handlers
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, { status: newStatus });
      await loadDashboardData();
      setShowBookingModal(false);
      setSelectedBooking(null);
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      await bookingService.cancelBooking(bookingId, { reason });
      await loadDashboardData();
      setShowBookingModal(false);
      setSelectedBooking(null);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleRescheduleBooking = async (bookingId, newStartTime) => {
    try {
      await bookingService.rescheduleBooking(bookingId, { newStartTime });
      await loadDashboardData();
      setShowBookingModal(false);
      setSelectedBooking(null);
    } catch (err) {
      alert(err.message || 'Failed to reschedule booking');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'services', label: 'Services', icon: '✨' },
    { id: 'staff', label: 'Staff', icon: '👥' },
    { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  ];

  return (
    <ErrorBoundary>
      <div style={{ backgroundColor: '#F7F9FD', minHeight: '100vh', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.5rem' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.firstName || 'Owner'}
          </h1>
          <p style={{ color: '#5F6368', fontSize: '1rem' }}>
            Manage your bookings, services, and staff all in one place
          </p>
        </div>

        {/* Tabs */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#E8F0FE' : 'transparent',
                color: activeTab === tab.id ? '#1A73E8' : '#5F6368',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#5F6368', fontSize: '1.125rem' }}>Loading your booking dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ backgroundColor: '#FFF4F4', border: '1px solid #FFD4D4', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
            <p style={{ color: '#D93025', fontSize: '1rem', margin: 0 }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Dashboard Tab */}
        {!loading && activeTab === 'dashboard' && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <KPICard
                icon="📅"
                title="Today's Appointments"
                value={stats?.todayAppointments || 0}
                subtitle="Scheduled for today"
              />
              <KPICard
                icon="💰"
                title="This Week"
                value={`$${stats?.weekRevenue || 0}`}
                subtitle="Total revenue"
              />
              <KPICard
                icon="📊"
                title="Total Bookings"
                value={stats?.totalBookings || 0}
                subtitle="All time"
              />
              <KPICard
                icon="⚠️"
                title="Pending"
                value={stats?.pendingBookings || 0}
                subtitle="Awaiting confirmation"
              />
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <QuickActionButton icon="✨" label="Add Service" onClick={() => setActiveTab('services')} />
                <QuickActionButton icon="👥" label="Add Staff" onClick={() => setActiveTab('staff')} />
                <QuickActionButton icon="📅" label="View Calendar" onClick={() => setActiveTab('calendar')} />
                <QuickActionButton icon="📊" label="View Bookings" onClick={() => setActiveTab('bookings')} />
              </div>
            </div>

            {/* Recent Bookings */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>Recent Bookings</h2>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#5F6368' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No bookings yet</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Your bookings will appear here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookings.slice(0, 5).map((booking) => (
                    <BookingCard key={booking._id} booking={booking} onClick={handleViewBooking} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {!loading && activeTab === 'bookings' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>All Bookings</h2>
            <p style={{ color: '#5F6368', marginBottom: '1rem' }}>Manage and track all your appointments</p>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#5F6368' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No bookings found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bookings.map((booking) => <BookingCard key={booking._id} booking={booking} onClick={handleViewBooking} />)}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {!loading && activeTab === 'services' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.25rem' }}>Services</h2>
                <p style={{ color: '#5F6368', fontSize: '0.875rem' }}>Manage your services and pricing</p>
              </div>
              <button
                onClick={handleCreateService}
                style={{
                  backgroundColor: '#1A73E8',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>+</span> Add Service
              </button>
            </div>
            {services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#5F6368' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No services added yet</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Create your first service to start accepting bookings</p>
                <button
                  onClick={handleCreateService}
                  style={{ backgroundColor: '#1A73E8', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                  Add Your First Service
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onEdit={() => handleEditService(service)}
                    onDelete={() => handleDeleteService(service._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Staff Tab */}
        {!loading && activeTab === 'staff' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.25rem' }}>Staff</h2>
                <p style={{ color: '#5F6368', fontSize: '0.875rem' }}>Manage your team and schedules</p>
              </div>
              <button
                onClick={handleCreateStaff}
                style={{
                  backgroundColor: '#1A73E8',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>+</span> Add Staff Member
              </button>
            </div>
            {staff.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#5F6368' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No staff members yet</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Add team members to start assigning services</p>
                <button
                  onClick={handleCreateStaff}
                  style={{ backgroundColor: '#1A73E8', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                  Add Staff Member
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {staff.map((member) => (
                  <StaffCard
                    key={member._id}
                    staff={member}
                    onEdit={() => handleEditStaff(member)}
                    onDelete={() => handleDeleteStaff(member._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {!loading && activeTab === 'calendar' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1B1E28', marginBottom: '1rem' }}>Calendar</h2>
            <p style={{ color: '#5F6368', marginBottom: '1rem' }}>View and manage your booking schedule</p>
            <div style={{ textAlign: 'center', padding: '3rem', color: '#5F6368' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Calendar view coming soon</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Full calendar integration in next update</p>
            </div>
          </div>
        )}

        {/* Modals */}
        <ServiceModal
          isOpen={showServiceModal}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onSave={handleSaveService}
          service={editingService}
          staff={staff}
        />

        <StaffModal
          isOpen={showStaffModal}
          onClose={() => {
            setShowStaffModal(false);
            setEditingStaff(null);
          }}
          onSave={handleSaveStaff}
          staffMember={editingStaff}
        />

        <BookingDetailModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onStatusUpdate={handleBookingStatusUpdate}
          onCancel={handleCancelBooking}
          onReschedule={handleRescheduleBooking}
        />
      </div>
    </ErrorBoundary>
  );
};

// Helper Components
const KPICard = ({ icon, title, value, subtitle }) => (
  <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.25rem' }}>{value}</div>
    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#1B1E28', marginBottom: '0.25rem' }}>{title}</div>
    <div style={{ fontSize: '0.875rem', color: '#5F6368' }}>{subtitle}</div>
  </div>
);

const QuickActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: '#E8F0FE',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1rem',
      fontWeight: 500,
      color: '#1A73E8',
      transition: 'all 0.2s'
    }}
  >
    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const BookingCard = ({ booking, onClick }) => (
  <div
    onClick={() => onClick(booking)}
    style={{
      border: '1px solid #E8EAED',
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: 'white'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#F7F9FD';
      e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'white';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.25rem' }}>
        {booking.customerName || 'Customer'}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#5F6368' }}>
        {booking.serviceName || 'Service'} • {booking.staffName || 'Staff'}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#5F6368', marginTop: '0.25rem' }}>
        {new Date(booking.startTime).toLocaleString()}
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: booking.status === 'confirmed' ? '#E6F4EA' : '#FFF4E6',
        color: booking.status === 'confirmed' ? '#0F9D58' : '#E67E22',
        textTransform: 'capitalize'
      }}>
        {booking.status || 'pending'}
      </span>
      <span style={{ fontSize: '1.25rem', color: '#5F6368' }}>→</span>
    </div>
  </div>
);

const ServiceCard = ({ service, onEdit, onDelete }) => (
  <div style={{ border: '1px solid #E8EAED', borderRadius: '12px', padding: '1rem' }}>
    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.5rem' }}>
      {service.name}
    </div>
    <div style={{ fontSize: '0.875rem', color: '#5F6368', marginBottom: '0.75rem' }}>
      {service.description || 'No description'}
    </div>
    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#5F6368', marginBottom: '1rem' }}>
      <span>💰 ${service.price}</span>
      <span>⏱️ {service.duration}min</span>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E8EAED' }}>
      <button
        onClick={() => onEdit(service)}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: '#E8F0FE',
          border: 'none',
          borderRadius: '8px',
          color: '#1A73E8',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#D2E3FC'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#E8F0FE'}
      >
        ✏️ Edit
      </button>
      <button
        onClick={() => onDelete(service._id)}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: '#FEEAEA',
          border: 'none',
          borderRadius: '8px',
          color: '#D93025',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#FDD'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#FEEAEA'}
      >
        🗑️ Delete
      </button>
    </div>
  </div>
);

const StaffCard = ({ staff, onEdit, onDelete }) => (
  <div style={{ border: '1px solid #E8EAED', borderRadius: '12px', padding: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
        👤
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1B1E28', marginBottom: '0.25rem' }}>
          {staff.fullName || `${staff.firstName} ${staff.lastName}`}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#5F6368' }}>
          {staff.role || 'Staff'} • {staff.isActive ? '🟢 Active' : '🔴 Inactive'}
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E8EAED' }}>
      <button
        onClick={() => onEdit(staff)}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: '#E8F0FE',
          border: 'none',
          borderRadius: '8px',
          color: '#1A73E8',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#D2E3FC'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#E8F0FE'}
      >
        ✏️ Edit
      </button>
      <button
        onClick={() => onDelete(staff._id)}
        style={{
          flex: 1,
          padding: '0.5rem',
          backgroundColor: '#FEEAEA',
          border: 'none',
          borderRadius: '8px',
          color: '#D93025',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#FDD'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#FEEAEA'}
      >
        🗑️ Delete
      </button>
    </div>
  </div>
);

export default BookingManager;
