import React, { useState } from 'react';
import ProfileManager from './ProfileManager';
import ServiceManager from './ServiceManager';
import BookingManager from './BookingManager';
import PaymentManager from './PaymentManager';

/**
 * Microservices Dashboard Component
 * Unified view of all microservices integration
 * 
 * Features:
 * - Tabbed interface for all microservices
 * - Profile management
 * - Service management
 * - Booking management
 * - Payment management
 */
const MicroservicesDashboard = () => {
  const [activeService, setActiveService] = useState('profile');

  const services = [
    { id: 'profile', name: 'Profile Service', icon: '👤', color: 'blue' },
    { id: 'service', name: 'Service Management', icon: '✂️', color: 'green' },
    { id: 'booking', name: 'Booking Management', icon: '📅', color: 'purple' },
    { id: 'payment', name: 'Payment Management', icon: '💳', color: 'orange' }
  ];

  const renderActiveService = () => {
    switch (activeService) {
      case 'profile':
        return <ProfileManager />;
      case 'service':
        return <ServiceManager />;
      case 'booking':
        return <BookingManager />;
      case 'payment':
        return <PaymentManager />;
      default:
        return <ProfileManager />;
    }
  };

  return (
    <div className="microservices-dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            SalonHub Microservices Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your profile, services, bookings, and payments
          </p>
        </div>
      </div>

      {/* Service Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeService === service.id
                  ? `border-${service.color}-600 bg-${service.color}-50 shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-3xl mb-2">{service.icon}</div>
              <div className="text-sm font-semibold text-gray-900">
                {service.name}
              </div>
              {activeService === service.id && (
                <div className={`mt-2 text-xs font-medium text-${service.color}-600`}>
                  Active
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Service Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderActiveService()}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Microservices Architecture
          </h3>
          <p className="text-sm text-blue-800">
            This dashboard demonstrates the integration of SalonHub's microservices architecture:
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
            <li>• <strong>Profile Service (Port 6001):</strong> User profiles, social features, timeline posts</li>
            <li>• <strong>Booking Service (Port 6002):</strong> Services, staff, appointments, availability</li>
            <li>• <strong>Payment Service (Port 6003):</strong> Stripe Connect, subscriptions, transactions</li>
            <li>• <strong>Main Backend (Port 5000):</strong> Authentication, proxy gateway</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MicroservicesDashboard;
