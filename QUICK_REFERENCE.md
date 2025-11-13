# SalonHub Microservices - Quick Reference

## System Architecture
```
Frontend (3000) → Main Backend (5000) → Profile (6001)
                                      → Booking (6002)
                                      → Payment (6003)
```

## Quick Start
```powershell
# Start all services
.\start-all-services.ps1

# Test all services
.\test-services.ps1

# Integration test
.\integration-test.ps1
```

## Service Ports
| Service | Port | Database |
|---------|------|----------|
| Main Backend | 5000 | main DB |
| Profile | 6001 | salonhub-profiles |
| Booking | 6002 | salonhub-booking |
| Payment | 6003 | salonhub-payment |

## API Endpoints

### Profile Service (`/api/profiles-service`)
- `GET /profiles/me` - Get my profile
- `POST /profiles` - Create/update profile
- `POST /profiles/follow/:userId` - Follow user
- `DELETE /profiles/unfollow/:userId` - Unfollow
- `POST /timeline` - Create post
- `GET /timeline/:userId` - Get timeline

### Booking Service (`/api/booking-service`)
- `GET /services` - List services
- `POST /services` - Create service
- `GET /staff` - List staff
- `POST /staff` - Add staff
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `GET /availability/:staffId` - Check availability

### Payment Service (`/api/payment-service`)
- `POST /payments/deposit` - Create deposit
- `POST /subscriptions` - Create subscription
- `GET /subscriptions` - List subscriptions
- `POST /connect/account` - Create Stripe account
- `POST /webhooks/stripe` - Stripe webhooks

## Authentication
```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body (@{email="user@example.com";password="pass"} | ConvertTo-Json) `
    -ContentType "application/json"

# Use token
$headers = @{"Authorization" = "Bearer $($response.token)"}

# Make authenticated request
Invoke-RestMethod -Uri "http://localhost:5000/api/profiles-service/profiles/me" `
    -Method GET -Headers $headers
```

## Frontend API Clients
```javascript
import { profileService } from './api/profileService';
import { bookingService } from './api/bookingService';
import { paymentService } from './api/paymentService';

// Profile
await profileService.getMyProfile();
await profileService.followUser(userId);

// Booking
await bookingService.getAllServices(ownerId);
await bookingService.createBooking(data);

// Payment
await paymentService.createSubscription(planId);
```

## Docker Commands
```bash
# Start with Docker
docker-compose -f docker-compose-microservices.yml up -d

# View logs
docker-compose -f docker-compose-microservices.yml logs -f

# Stop services
docker-compose -f docker-compose-microservices.yml down

# Rebuild
docker-compose -f docker-compose-microservices.yml up -d --build
```

## Troubleshooting

### Service Not Responding
```powershell
# Check if running
netstat -ano | findstr ":5000 :6001 :6002 :6003"

# Restart service
cd services/profile-service
npm run dev
```

### 401 Unauthorized
- Get new token via `/api/auth/login`
- Check token in Authorization header

### 503 Service Unavailable
- Verify microservice is running
- Check MongoDB connection

## File Locations

### Backend
- `backend/routes/profileProxyRoutes.js` - Profile proxy
- `backend/routes/bookingProxyRoutes.js` - Booking proxy
- `backend/routes/paymentProxyRoutes.js` - Payment proxy
- `backend/controllers/authController.js` - Auth verify

### Microservices
- `services/profile-service/` - Profile microservice
- `services/booking-service/` - Booking microservice
- `services/payment-service/` - Payment microservice

### Frontend
- `frontend/src/api/profileService.js` - Profile API client
- `frontend/src/api/bookingService.js` - Booking API client
- `frontend/src/api/paymentService.js` - Payment API client

### Documentation
- `MICROSERVICES_README.md` - Full documentation
- `MICROSERVICES_COMPLETE.md` - Implementation summary
- `INTEGRATION_TESTING.md` - Testing guide

### Scripts
- `start-all-services.ps1` - Start all services
- `test-services.ps1` - Health check
- `integration-test.ps1` - Integration test

## Environment Variables

### Main Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
```

### Profile Service (.env)
```
PORT=6001
MONGO_URI=mongodb+srv://.../salonhub-profiles
MAIN_BACKEND_URL=http://localhost:5000
```

### Booking Service (.env)
```
PORT=6002
MONGO_URI=mongodb+srv://.../salonhub-booking
MAIN_BACKEND_URL=http://localhost:5000
```

### Payment Service (.env)
```
PORT=6003
MONGO_URI=mongodb+srv://.../salonhub-payment
MAIN_BACKEND_URL=http://localhost:5000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Common Tasks

### Add New Endpoint
1. Add route in microservice `routes/` folder
2. Add controller method in `controllers/`
3. Add business logic in `services/`
4. Add frontend method in `frontend/src/api/`

### Debug Request Flow
1. Check frontend makes request to main backend
2. Verify token in Authorization header
3. Main backend validates token
4. Proxy forwards to microservice
5. Microservice validates token via `/api/auth/verify`
6. Microservice processes request

### Monitor Services
```powershell
# Check logs
# Main Backend terminal
# Profile Service terminal
# Booking Service terminal
# Payment Service terminal
```

## Support Links
- Full Docs: `MICROSERVICES_README.md`
- Testing: `INTEGRATION_TESTING.md`
- Implementation: `MICROSERVICES_COMPLETE.md`
