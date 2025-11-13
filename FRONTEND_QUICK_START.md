# Quick Start: Testing Microservices with Frontend

## Prerequisites Check

Before starting, verify all services are configured:

```powershell
# Run service check
.\test-services.ps1
```

Expected output:
```
[OK] Main Backend is running on port 5000
[OK] Profile Service is running on port 6001
[OK] Booking Service is running on port 6002
[OK] Payment Service is running on port 6003
```

## Starting All Services

### Terminal Setup (5 terminals needed)

**Terminal 1 - Main Backend:**
```powershell
cd backend
npm run dev
```
Wait for: `Server running on port 5000`

**Terminal 2 - Profile Service:**
```powershell
cd services/profile-service
npm run dev
```
Wait for: `Profile Service listening on port 6001`

**Terminal 3 - Booking Service:**
```powershell
cd services/booking-service
npm run dev
```
Wait for: `Booking Service listening on port 6002`

**Terminal 4 - Payment Service:**
```powershell
cd services/payment-service
npm run dev
```
Wait for: `Payment Service listening on port 6003`

**Terminal 5 - Frontend:**
```powershell
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:3000/`

## Frontend Integration Steps

### Step 1: Add Routes to Your App

Open `frontend/src/App.jsx` and add the microservices routes:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MicroservicesRoutes from './routes/MicroservicesRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Add microservices routes */}
        <Route path="/microservices/*" element={<MicroservicesRoutes />} />
        
        {/* Your existing routes */}
        <Route path="/" element={<Home />} />
        {/* ... other routes */}
      </Routes>
    </Router>
  );
}
```

### Step 2: Add Navigation Links

Add navigation links to your header/navbar:

```jsx
import { Link } from 'react-router-dom';

<nav>
  <Link to="/microservices">Microservices Dashboard</Link>
  <Link to="/microservices/profile">Profile</Link>
  <Link to="/microservices/services">Services</Link>
  <Link to="/microservices/bookings">Bookings</Link>
  <Link to="/microservices/payments">Payments</Link>
</nav>
```

### Step 3: Test Authentication

The components require authentication. Make sure you're logged in:

1. Navigate to your login page
2. Login with test credentials
3. Verify JWT token is stored (check localStorage/cookies)
4. Navigate to `/microservices`

## Testing Each Component

### 1. Profile Manager (`/microservices/profile`)

**Test Cases:**

✅ **View Profile:**
- Navigate to `/microservices/profile`
- Should load your profile automatically
- Check console for any errors

✅ **Update Profile:**
- Enter bio text
- Add Instagram URL (e.g., `https://instagram.com/yoursalon`)
- Add Facebook URL (e.g., `https://facebook.com/yoursalon`)
- Click "Update Profile"
- Should see success message

✅ **Create Timeline Post:**
- Select post type (post/survey)
- Enter content text
- Click "Create Post"
- Should see success message

**Expected API Calls:**
```
GET  /api/profiles-service/me
PATCH /api/profiles-service/me
POST  /api/profiles-service/me/timeline-posts
```

### 2. Service Manager (`/microservices/services`)

**Test Cases:**

✅ **Create Service:**
- Click "+ New Service"
- Fill in:
  - Name: "Premium Haircut"
  - Category: "haircut"
  - Price: 50.00
  - Duration: 60 minutes
  - Deposit: 12.50 (optional)
  - Description: "Professional haircut service"
- Click "Create Service"
- Should appear in services list

✅ **View Services:**
- Should see all your services
- Each card shows: name, category, price, duration, deposit

✅ **Delete Service:**
- Click "Delete" on any service
- Confirm deletion
- Service should be removed

**Expected API Calls:**
```
GET    /api/booking-service/services/my
POST   /api/booking-service/services
DELETE /api/booking-service/services/:id
```

### 3. Booking Manager (`/microservices/bookings`)

**Test Cases:**

✅ **Create Booking:**
- Click "+ New Booking"
- Select a service from dropdown
- Choose date (future date)
- Choose time
- Add notes (optional)
- Click "Create Booking"
- Should appear in bookings list

✅ **View Bookings:**
- Should see all bookings
- Check status colors (pending=yellow, confirmed=green, etc.)

✅ **Update Booking Status:**
- For pending bookings:
  - Click "Confirm" → status changes to confirmed
  - Click "Cancel" → status changes to cancelled
- For confirmed bookings:
  - Click "Mark Complete" → status changes to completed
  - Click "No Show" → status changes to no-show

**Expected API Calls:**
```
GET   /api/booking-service/bookings/my
GET   /api/booking-service/services/my
POST  /api/booking-service/bookings
PATCH /api/booking-service/bookings/:id/status
```

### 4. Payment Manager (`/microservices/payments`)

**Test Cases:**

✅ **View Transactions Tab:**
- Click "Transactions" tab
- Should show all payment transactions
- Check: amount, date, status, Stripe payment ID

✅ **View Subscriptions Tab:**
- Click "Subscriptions" tab
- Should show active subscriptions
- Check: plan name, price, billing cycle, features

✅ **Stripe Account Tab:**
- Click "Stripe Account" tab
- If not connected: Shows "Connect with Stripe" button
- If connected: Shows account details (ID, charges enabled, payouts enabled)

✅ **Connect Stripe:**
- Click "Connect with Stripe"
- Should redirect to Stripe onboarding
- Complete Stripe setup
- Return to app → should show connected status

**Expected API Calls:**
```
GET  /api/payment-service/payments/transactions/my
GET  /api/payment-service/subscriptions/my
GET  /api/payment-service/stripe/connect
POST /api/payment-service/stripe/connect
```

### 5. Microservices Dashboard (`/microservices`)

**Test Cases:**

✅ **Service Navigation:**
- Click each service card (Profile, Services, Bookings, Payments)
- Should switch between components
- Active service should be highlighted

✅ **All Components Work:**
- Test each component within dashboard
- All features should work same as individual routes

## Common Issues & Solutions

### Issue: "Failed to load profile"
**Solution:**
- Check if Profile Service is running on port 6001
- Verify authentication token in localStorage
- Check browser console for detailed error
- Check Profile Service terminal for logs

### Issue: "Network Error"
**Solution:**
- Verify all services are running: `.\test-services.ps1`
- Check CORS settings in backend
- Verify proxy routes in main backend (port 5000)

### Issue: "401 Unauthorized"
**Solution:**
- Login again to get fresh JWT token
- Check token expiration
- Verify authMiddleware is working on microservices

### Issue: Services list is empty
**Solution:**
- This is normal for new users
- Create your first service using "+ New Service" button
- Services will appear after creation

### Issue: "Validation Error"
**Solution:**
- Check required fields are filled
- Verify enum values (e.g., category must be lowercase: "haircut" not "Hair")
- Check number formats (price/duration must be valid numbers)

## Verification Checklist

Before testing frontend:

- [ ] All 4 services running (5000, 6001, 6002, 6003)
- [ ] MongoDB Atlas connected (check service logs)
- [ ] Frontend running on port 3000
- [ ] User logged in with valid JWT token
- [ ] Routes added to App.jsx
- [ ] Navigation links added (optional)

During testing:

- [ ] Profile loads automatically
- [ ] Can update profile successfully
- [ ] Can create timeline posts
- [ ] Can create services
- [ ] Can view/delete services
- [ ] Can create bookings
- [ ] Can update booking status
- [ ] Can view transactions
- [ ] Can view subscriptions
- [ ] Can connect Stripe account

## Browser Console Debugging

Open DevTools (F12) and check:

**Network Tab:**
- See all API requests
- Check status codes (200 = success, 401 = unauthorized, 404 = not found, 500 = server error)
- View request/response data

**Console Tab:**
- Check for JavaScript errors
- See console.log outputs from components
- View error stack traces

**Application Tab:**
- Check localStorage for JWT token
- Verify token format: `Bearer eyJ...`

## Performance Testing

Run E2E tests to verify backend:

```powershell
.\e2e-test.ps1
```

Should show: `ALL TESTS PASSED!`

## Next Steps

After successful testing:

1. **Customize Styling:**
   - Update Tailwind classes
   - Add your brand colors
   - Modify layouts

2. **Add Features:**
   - Image uploads for services
   - Calendar view for bookings
   - Charts for payment analytics
   - Real-time notifications

3. **Production Prep:**
   - Environment variables for production
   - Error monitoring (Sentry, LogRocket)
   - Analytics tracking
   - Performance optimization

4. **Deploy:**
   - Build frontend: `npm run build`
   - Deploy to Vercel/Netlify
   - Deploy microservices to cloud
   - Configure production MongoDB

## Support Resources

- **E2E Test Results:** `E2E_TEST_RESULTS.md`
- **Success Report:** `FINAL_SUCCESS_REPORT.md`
- **Integration Guide:** `FRONTEND_INTEGRATION_GUIDE.md`
- **API Documentation:** Check each service's README
- **Backend Logs:** Check terminal output of each service

## Quick Commands Reference

```powershell
# Check all services
.\test-services.ps1

# Run E2E tests
.\e2e-test.ps1

# Stop all Node processes (if needed)
Get-Process node | Stop-Process -Force

# Check specific port
Get-NetTCPConnection -LocalPort 5000

# View backend logs (in backend terminal)
# Ctrl+C to stop service
```

## Success Indicators

✅ All 4 services running  
✅ Frontend loads without errors  
✅ Can login successfully  
✅ Can navigate to /microservices  
✅ All tabs/components render  
✅ Can perform CRUD operations  
✅ API calls succeed (check Network tab)  
✅ No console errors  
✅ Data persists to MongoDB  
✅ UI updates reflect backend changes  

**You're ready for production deployment! 🚀**
