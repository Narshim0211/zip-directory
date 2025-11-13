# Frontend Microservices Integration Guide

## Overview
This document outlines the React components created to demonstrate integration with SalonHub's microservices architecture.

## Components Created

### 1. ProfileManager.jsx
**Location:** `frontend/src/components/microservices/ProfileManager.jsx`

**Features:**
- View user profile
- Update profile (bio, social links)
- Create timeline posts
- Error handling and loading states
- Uses Profile Service API (Port 6001)

**API Methods Used:**
- `profileService.getMyProfile()` - Get current user's profile
- `profileService.upsertProfile(data)` - Create/update profile
- `profileService.createTimelinePost(data)` - Create timeline post

### 2. ServiceManager.jsx
**Location:** `frontend/src/components/microservices/ServiceManager.jsx`

**Features:**
- View all services
- Create new services
- Delete services
- Service categories (haircut, coloring, styling, etc.)
- Uses Booking Service API (Port 6002)

**API Methods Used:**
- `bookingService.getMyServices()` - Get all services
- `bookingService.createService(data)` - Create new service
- `bookingService.deleteService(id)` - Delete service

### 3. BookingManager.jsx
**Location:** `frontend/src/components/microservices/BookingManager.jsx`

**Features:**
- View all bookings
- Create new bookings
- Update booking status (confirm, cancel, complete, no-show)
- Date/time picker
- Service selection
- Uses Booking Service API (Port 6002)

**API Methods Used:**
- `bookingService.getMyBookings()` - Get all bookings
- `bookingService.getMyServices()` - Get services for booking form
- `bookingService.createBooking(data)` - Create new booking
- `bookingService.updateBookingStatus(id, status)` - Update booking status

### 4. PaymentManager.jsx
**Location:** `frontend/src/components/microservices/PaymentManager.jsx`

**Features:**
- View payment transactions
- View subscriptions
- Connect Stripe account
- Tabbed interface (Transactions, Subscriptions, Stripe)
- Currency formatting
- Uses Payment Service API (Port 6003)

**API Methods Used:**
- `paymentService.getMyTransactions()` - Get transaction history
- `paymentService.getMySubscriptions()` - Get active subscriptions
- `paymentService.getStripeAccount()` - Get Stripe account status
- `paymentService.createConnectAccount()` - Connect Stripe account

### 5. MicroservicesDashboard.jsx
**Location:** `frontend/src/components/microservices/MicroservicesDashboard.jsx`

**Features:**
- Unified dashboard for all microservices
- Service navigation tabs
- Visual service indicators
- Architecture information
- Responsive design

**Contains:**
- All 4 component integrations in one view
- Service switcher
- System architecture documentation

## Integration Pattern

All components follow the same integration pattern:

```jsx
import React, { useState, useEffect } from 'react';
import apiService from '../../api/[serviceName]Service';

const Component = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getData();
      
      if (response.success) {
        setData(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // ... render UI
};
```

## How to Use in Your Application

### Option 1: Add to React Router
Update your main routing file (e.g., `App.jsx` or `routes.js`):

```jsx
import MicroservicesDashboard from './components/microservices/MicroservicesDashboard';
import ProfileManager from './components/microservices/ProfileManager';
import ServiceManager from './components/microservices/ServiceManager';
import BookingManager from './components/microservices/BookingManager';
import PaymentManager from './components/microservices/PaymentManager';

// In your routes:
<Route path="/microservices" element={<MicroservicesDashboard />} />
<Route path="/profile" element={<ProfileManager />} />
<Route path="/services" element={<ServiceManager />} />
<Route path="/bookings" element={<BookingManager />} />
<Route path="/payments" element={<PaymentManager />} />
```

### Option 2: Use Individual Components
Import and use components directly in your existing pages:

```jsx
import ProfileManager from './components/microservices/ProfileManager';

const MyPage = () => {
  return (
    <div>
      <h1>My Account</h1>
      <ProfileManager />
    </div>
  );
};
```

## Testing the Components

### Prerequisites
1. All microservices must be running:
   - Main Backend: Port 5000
   - Profile Service: Port 6001
   - Booking Service: Port 6002
   - Payment Service: Port 6003

2. User must be authenticated (have valid JWT token)

### Test Steps

1. **Start All Services:**
   ```powershell
   # Terminal 1 - Main Backend
   cd backend
   npm run dev

   # Terminal 2 - Profile Service
   cd services/profile-service
   npm run dev

   # Terminal 3 - Booking Service
   cd services/booking-service
   npm run dev

   # Terminal 4 - Payment Service
   cd services/payment-service
   npm run dev

   # Terminal 5 - Frontend
   cd frontend
   npm run dev
   ```

2. **Access Components:**
   - Navigate to the route where you added the components
   - Login if not already authenticated
   - Test each feature:
     - Profile: View, update, create posts
     - Services: Create, view, delete
     - Bookings: Create, view, update status
     - Payments: View transactions, subscriptions, connect Stripe

## API Client Reference

All components use the existing API clients in `frontend/src/api/`:

### profileService.js
- `getMyProfile()` - GET /api/profiles-service/me
- `upsertProfile(data)` - PATCH /api/profiles-service/me
- `createTimelinePost(data)` - POST /api/profiles-service/me/timeline-posts

### bookingService.js
- `getMyServices()` - GET /api/booking-service/services/my
- `createService(data)` - POST /api/booking-service/services
- `deleteService(id)` - DELETE /api/booking-service/services/:id
- `getMyBookings()` - GET /api/booking-service/bookings/my
- `createBooking(data)` - POST /api/booking-service/bookings
- `updateBookingStatus(id, status)` - PATCH /api/booking-service/bookings/:id/status

### paymentService.js
- `getMyTransactions()` - GET /api/payment-service/payments/transactions/my
- `getMySubscriptions()` - GET /api/payment-service/subscriptions/my
- `getStripeAccount()` - GET /api/payment-service/stripe/connect
- `createConnectAccount()` - POST /api/payment-service/stripe/connect

## Styling

All components use Tailwind CSS classes. Make sure Tailwind is configured in your project:

```javascript
// tailwind.config.js should include:
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
]
```

## Error Handling

All components include comprehensive error handling:

- **Network Errors**: Displays error message from API response
- **404 Responses**: Handles gracefully (e.g., no subscriptions yet)
- **Validation Errors**: Shows field-specific error messages
- **Loading States**: Shows loading indicators during API calls

## Success Messages

Components show success messages after:
- Creating records
- Updating records
- Deleting records
- Connecting services (Stripe)

## State Management

Components use local React state (useState, useEffect). For larger applications, consider integrating with:
- Redux
- Context API
- Zustand
- Recoil

## Next Steps

1. **Add to Router**: Integrate components into your routing system
2. **Test Live**: Run all services and test each component
3. **Customize Styling**: Adjust Tailwind classes to match your design
4. **Add Validation**: Enhance form validation if needed
5. **Add Analytics**: Track user interactions
6. **Error Logging**: Send errors to monitoring service
7. **Loading Skeletons**: Replace loading text with skeleton screens
8. **Pagination**: Add pagination for large datasets
9. **Filters/Search**: Add filtering and search capabilities
10. **Mobile Optimization**: Enhance mobile responsiveness

## Production Checklist

- [ ] Environment variables configured
- [ ] Error boundaries added
- [ ] Analytics tracking implemented
- [ ] Performance optimized (lazy loading, code splitting)
- [ ] Accessibility tested (WCAG compliance)
- [ ] Cross-browser testing completed
- [ ] Mobile responsive design verified
- [ ] Loading states optimized
- [ ] Error messages user-friendly
- [ ] Success feedback clear

## Support

For issues or questions:
1. Check E2E test results: `E2E_TEST_RESULTS.md`
2. Review success report: `FINAL_SUCCESS_REPORT.md`
3. Check API documentation in each service
4. Review backend logs for API errors
