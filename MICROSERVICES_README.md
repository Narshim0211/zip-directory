# SalonHub Microservices Architecture

## System Overview

SalonHub uses a **hybrid monolith + microservices** architecture with shared authentication:

```
Frontend (Port 3000)
    ↓
Main Backend (Port 5000) - Authentication Gateway + Proxy
    ↓
    ├── Profile Microservice (Port 6001)
    ├── Booking Microservice (Port 6002)
    └── Payment Microservice (Port 6003)
```

## Architecture Details

### Main Backend (Port 5000)
- **Purpose**: Authentication, authorization, and API gateway
- **Database**: MongoDB Atlas (shared with existing features)
- **Key Features**:
  - JWT token generation and validation
  - User authentication (owner/staff/customer/admin roles)
  - Proxy gateway to all microservices
  - Existing features: feed, time manager, reviews, business listings

### Profile Microservice (Port 6001)
- **Database**: `salonhub-profiles`
- **Features**:
  - User profile management (bio, avatar, social links)
  - Follow/unfollow system
  - Timeline posts and surveys
  - Owner business information
- **Endpoints**: `/api/profiles-service/*`

### Booking Microservice (Port 6002)
- **Database**: `salonhub-booking`
- **Features**:
  - Service management (pricing, duration, deposits)
  - Staff scheduling with timezone support
  - Availability engine (generates time slots)
  - Appointment booking with conflict prevention
  - Cancel/reschedule with 24hr policy
- **Endpoints**: `/api/booking-service/*`

### Payment Microservice (Port 6003)
- **Database**: `salonhub-payment`
- **Features**:
  - Stripe Connect integration
  - Subscription billing ($10 Basic / $20 Premium monthly)
  - 25% deposit system for appointments
  - Webhook handling for payment events
  - Invoice generation
- **Endpoints**: `/api/payment-service/*`

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payment features)

### Installation

1. **Install Main Backend Dependencies**
```powershell
cd backend
npm install
```

2. **Install Microservice Dependencies**
```powershell
# Profile Service
cd services/profile-service
npm install

# Booking Service
cd ../booking-service
npm install

# Payment Service
cd ../payment-service
npm install
```

3. **Configure Environment Variables**

**Backend `.env`** (main backend):
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Profile Service `.env`**:
```env
PORT=6001
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/salonhub-profiles
MAIN_BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

**Booking Service `.env`**:
```env
PORT=6002
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/salonhub-booking
MAIN_BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

**Payment Service `.env`**:
```env
PORT=6003
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/salonhub-payment
MAIN_BACKEND_URL=http://localhost:5000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASIC_PLAN_ID=price_...
PREMIUM_PLAN_ID=price_...
```

### Running the System

**Option 1: Start All Services Manually (Development)**

Open 4 separate terminals:

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
```

**Option 2: Using Docker Compose (Production-ready)**
```powershell
docker-compose up -d
```

### Verify Services are Running

```powershell
# Check all ports
netstat -ano | findstr ":5000 :6001 :6002 :6003"
```

Expected output shows LISTENING status on all 4 ports.

## Authentication Flow

1. **User Login** → Main Backend (`POST /api/auth/login`)
   - Returns JWT token

2. **Frontend Request** → Includes JWT in Authorization header
   ```
   Authorization: Bearer <token>
   ```

3. **Main Backend Proxy** → Validates token, forwards to microservice
   - Profile requests: `/api/profiles-service/*` → Port 6001
   - Booking requests: `/api/booking-service/*` → Port 6002
   - Payment requests: `/api/payment-service/*` → Port 6003

4. **Microservice** → Calls main backend to verify token
   - `POST /api/auth/verify` with Authorization header
   - Returns user data: `{valid, userId, email, role, firstName, lastName, ownerId}`

5. **Response** → Microservice processes request, returns data

## API Endpoints

### Profile Service
```
GET    /api/profiles-service/health
GET    /api/profiles-service/profiles/me
POST   /api/profiles-service/profiles
PUT    /api/profiles-service/profiles
POST   /api/profiles-service/profiles/follow/:userId
DELETE /api/profiles-service/profiles/unfollow/:userId
GET    /api/profiles-service/profiles/:userId/followers
GET    /api/profiles-service/profiles/:userId/following
POST   /api/profiles-service/timeline
GET    /api/profiles-service/timeline/:userId
POST   /api/profiles-service/business
GET    /api/profiles-service/business/:ownerId
```

### Booking Service
```
GET    /api/booking-service/health

# Services
GET    /api/booking-service/services
POST   /api/booking-service/services
GET    /api/booking-service/services/:id
PUT    /api/booking-service/services/:id
DELETE /api/booking-service/services/:id

# Staff
GET    /api/booking-service/staff
POST   /api/booking-service/staff
GET    /api/booking-service/staff/:id
PUT    /api/booking-service/staff/:id
DELETE /api/booking-service/staff/:id

# Bookings
GET    /api/booking-service/bookings
POST   /api/booking-service/bookings
GET    /api/booking-service/bookings/:id
PUT    /api/booking-service/bookings/:id
POST   /api/booking-service/bookings/:id/cancel
POST   /api/booking-service/bookings/:id/reschedule

# Availability
GET    /api/booking-service/availability/:staffId
```

### Payment Service
```
GET    /api/payment-service/health

# Payments
POST   /api/payment-service/payments/deposit
POST   /api/payment-service/payments/full
POST   /api/payment-service/payments/refund
GET    /api/payment-service/payments/:id

# Subscriptions
POST   /api/payment-service/subscriptions
GET    /api/payment-service/subscriptions
PUT    /api/payment-service/subscriptions/:id
DELETE /api/payment-service/subscriptions/:id/cancel

# Stripe Connect
POST   /api/payment-service/connect/account
GET    /api/payment-service/connect/account
GET    /api/payment-service/connect/onboarding-link
GET    /api/payment-service/connect/dashboard-link

# Webhooks
POST   /api/payment-service/webhooks/stripe
```

## Frontend Integration

Frontend API clients are located in `frontend/src/api/`:

### Example Usage

```javascript
import { profileService } from './api/profileService';
import { bookingService } from './api/bookingService';
import { paymentService } from './api/paymentService';

// Profile operations
const profile = await profileService.getMyProfile();
await profileService.followUser(userId);

// Booking operations
const services = await bookingService.getAllServices(ownerId);
const availability = await bookingService.getAvailability(staffId, date);
await bookingService.createBooking(bookingData);

// Payment operations
await paymentService.createDeposit(bookingId, amount);
const subscription = await paymentService.createSubscription(planId);
```

## Database Schema

### Profile Service
- **Profile**: userId, role, bio, avatarUrl, followers/following counts
- **Follower**: followerId, followingId, timestamps
- **TimelinePost**: userId, content, surveyId, likes, comments
- **OwnerBusinessInfo**: ownerId, businessName, description, photos

### Booking Service
- **Service**: ownerId, name, description, price, duration, deposit, staffIds
- **Staff**: ownerId, userId, workingHours, timezone, isActive
- **Booking**: customerId, ownerId, serviceId, staffId, date/time, status, deposit
- **ScheduleException**: staffId, date, type (day_off/custom_hours)

### Payment Service
- **Transaction**: userId, stripePaymentIntentId, amount, type, status
- **Subscription**: userId, plan, status, stripeSubscriptionId, currentPeriod
- **StripeAccount**: ownerId, stripeAccountId, onboardingStatus, chargesEnabled

## Deployment

### Docker Deployment

1. Build images:
```bash
docker build -t salonhub-backend ./backend
docker build -t salonhub-profile ./services/profile-service
docker build -t salonhub-booking ./services/booking-service
docker build -t salonhub-payment ./services/payment-service
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

### Production Considerations

- **Environment Variables**: Use secrets management (AWS Secrets Manager, Azure Key Vault)
- **Database**: Separate MongoDB clusters for each microservice
- **Load Balancing**: Use Nginx or AWS ALB
- **Monitoring**: Implement logging aggregation (ELK stack, CloudWatch)
- **API Rate Limiting**: Add rate limiting to proxy gateway
- **HTTPS**: Enable SSL/TLS certificates
- **CORS**: Configure proper CORS origins for production domains

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill process
taskkill /F /PID <process_id>
```

### Microservice Can't Connect to Main Backend
- Verify main backend is running on port 5000
- Check `MAIN_BACKEND_URL` in microservice `.env`
- Ensure no firewall blocking localhost communication

### MongoDB Connection Errors
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### Authentication Failures
- Verify JWT_SECRET matches between main backend and `.env`
- Check token expiration settings
- Ensure Authorization header format: `Bearer <token>`

## Development Notes

- **Hot Reload**: All services use nodemon for auto-restart on file changes
- **Logging**: Structured JSON logging in all microservices
- **Error Handling**: Centralized error middleware in each service
- **Validation**: express-validator for request validation
- **Security**: Helmet.js for security headers, CORS configured

## Next Steps

1. ✅ All microservices running
2. ✅ Proxy gateway configured
3. ✅ Frontend API clients created
4. 🔄 Test end-to-end integration
5. 📝 Write integration tests
6. 🐳 Create docker-compose.yml
7. 📊 Add monitoring and logging
8. 🚀 Deploy to staging environment

## Support

For issues or questions, refer to:
- Main PRD: `IMPLEMENTATION_SUMMARY.md`
- API Documentation: Individual README files in each service directory
- Architecture Diagrams: `docs/architecture.md`
