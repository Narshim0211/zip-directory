import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Microservices Components
import MicroservicesDashboard from '../components/microservices/MicroservicesDashboard';
import ProfileManager from '../components/microservices/ProfileManager';
import ServiceManager from '../components/microservices/ServiceManager';
import BookingManager from '../components/microservices/BookingManager';
import PaymentManager from '../components/microservices/PaymentManager';

/**
 * Microservices Routes
 *
 * Add these routes to your main App.jsx or routing configuration
 *
 * Usage in App.jsx:
 * import MicroservicesRoutes from './routes/MicroservicesRoutes';
 *
 * <Routes>
 *   <Route path="/microservices/*" element={<MicroservicesRoutes />} />
 *   other routes
 * </Routes>
 */
const MicroservicesRoutes = () => {
  return (
    <Routes>
      <Route index element={<MicroservicesDashboard />} />
      <Route path="profile" element={<ProfileManager />} />
      <Route path="services" element={<ServiceManager />} />
      <Route path="bookings" element={<BookingManager />} />
      <Route path="payments" element={<PaymentManager />} />
      <Route path="*" element={<Navigate to="/microservices" replace />} />
    </Routes>
  );
};

export default MicroservicesRoutes;

/**
 * Alternative: Add routes directly to your main App.jsx
 * 
 * import MicroservicesDashboard from './components/microservices/MicroservicesDashboard';
 * import ProfileManager from './components/microservices/ProfileManager';
 * import ServiceManager from './components/microservices/ServiceManager';
 * import BookingManager from './components/microservices/BookingManager';
 * import PaymentManager from './components/microservices/PaymentManager';
 * 
 * <Routes>
 *   <Route path="/microservices" element={<MicroservicesDashboard />} />
 *   <Route path="/profile" element={<ProfileManager />} />
 *   <Route path="/services" element={<ServiceManager />} />
 *   <Route path="/bookings" element={<BookingManager />} />
 *   <Route path="/payments" element={<PaymentManager />} />
 * </Routes>
 */
