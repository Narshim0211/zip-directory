# Integration Testing Guide

## Overview

This guide walks you through testing the complete microservices architecture with real authentication tokens.

## Prerequisites

- All 4 services running (Main Backend + 3 Microservices)
- A test user account in the database
- Tool for API testing (Postman, curl, or PowerShell)

## Step 1: Create a Test User

### Option A: Using Existing User
If you already have users in your database, skip to Step 2.

### Option B: Register New User via API

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Request Body:**
```json
{
  "email": "test@salonhub.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "owner"
}
```

**PowerShell Command:**
```powershell
$body = @{
    email = "test@salonhub.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    role = "owner"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

## Step 2: Login and Get JWT Token

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "email": "test@salonhub.com",
  "password": "Test123!"
}
```

**PowerShell Command:**
```powershell
$loginBody = @{
    email = "test@salonhub.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

# Extract token
$token = $response.token
Write-Host "Token: $token"

# Save for later use
$env:SALONHUB_TOKEN = $token
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@salonhub.com",
    "role": "owner"
  }
}
```

## Step 3: Test Profile Service

### 3.1 Get My Profile
```powershell
$headers = @{
    "Authorization" = "Bearer $env:SALONHUB_TOKEN"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/profiles-service/profiles/me" `
    -Method GET `
    -Headers $headers
```

### 3.2 Update Profile
```powershell
$profileData = @{
    bio = "Professional salon owner"
    socialLinks = @{
        instagram = "@mysalon"
        facebook = "mysalon"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/profiles-service/profiles" `
    -Method POST `
    -Headers $headers `
    -Body $profileData
```

### 3.3 Create Timeline Post
```powershell
$postData = @{
    content = "Welcome to my salon! Check out our new services."
    contentType = "post"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/profiles-service/timeline" `
    -Method POST `
    -Headers $headers `
    -Body $postData
```

## Step 4: Test Booking Service

### 4.1 Create a Service
```powershell
$serviceData = @{
    name = "Haircut"
    description = "Professional haircut service"
    price = 50
    duration = 60
    deposit = 12.50
    category = "Hair"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/booking-service/services" `
    -Method POST `
    -Headers $headers `
    -Body $serviceData
```

### 4.2 Add Staff Member
```powershell
$staffData = @{
    userId = "staff_user_id_here"
    workingHours = @{
        monday = @{
            start = "09:00"
            end = "17:00"
        }
        tuesday = @{
            start = "09:00"
            end = "17:00"
        }
    }
    timezone = "America/New_York"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/booking-service/staff" `
    -Method POST `
    -Headers $headers `
    -Body $staffData
```

### 4.3 Check Availability
```powershell
$date = "2025-11-15"
$staffId = "your_staff_id_here"

Invoke-RestMethod -Uri "http://localhost:5000/api/booking-service/availability/$staffId?date=$date" `
    -Method GET `
    -Headers $headers
```

### 4.4 Create Booking
```powershell
$bookingData = @{
    serviceId = "your_service_id"
    staffId = "your_staff_id"
    date = "2025-11-15"
    startTime = "10:00"
    endTime = "11:00"
    customerNotes = "First time customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/booking-service/bookings" `
    -Method POST `
    -Headers $headers `
    -Body $bookingData
```

## Step 5: Test Payment Service

### 5.1 Create Stripe Connect Account
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/payment-service/connect/account" `
    -Method POST `
    -Headers $headers
```

### 5.2 Get Onboarding Link
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/payment-service/connect/onboarding-link" `
    -Method GET `
    -Headers $headers
```

### 5.3 Create Subscription
```powershell
$subscriptionData = @{
    planId = "price_basic_monthly_10"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/payment-service/subscriptions" `
    -Method POST `
    -Headers $headers `
    -Body $subscriptionData
```

### 5.4 Create Deposit Payment
```powershell
$depositData = @{
    bookingId = "your_booking_id"
    amount = 1250
    currency = "usd"
    paymentMethodId = "pm_card_visa"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/payment-service/payments/deposit" `
    -Method POST `
    -Headers $headers `
    -Body $depositData
```

## Step 6: Complete Integration Test Script

Create a file `authenticated-test.ps1`:

```powershell
# Authenticated Integration Test

Write-Host "Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "test@salonhub.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $response.token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing Profile Service..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:5000/api/profiles-service/profiles/me" `
        -Method GET `
        -Headers $headers
    Write-Host "✓ Profile service working" -ForegroundColor Green
} catch {
    Write-Host "✗ Profile service failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing Booking Service..." -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "http://localhost:5000/api/booking-service/services" `
        -Method GET `
        -Headers $headers
    Write-Host "✓ Booking service working" -ForegroundColor Green
} catch {
    Write-Host "✗ Booking service failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing Payment Service..." -ForegroundColor Yellow
try {
    $subscriptions = Invoke-RestMethod -Uri "http://localhost:5000/api/payment-service/subscriptions" `
        -Method GET `
        -Headers $headers
    Write-Host "✓ Payment service working" -ForegroundColor Green
} catch {
    Write-Host "✗ Payment service failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "All authenticated tests completed!" -ForegroundColor Green
```

## Testing with Postman

### 1. Create Collection
- Name: "SalonHub Microservices"

### 2. Set Environment Variables
```
baseUrl: http://localhost:5000
token: {{token}}
```

### 3. Create Requests

**Login Request:**
- Method: POST
- URL: `{{baseUrl}}/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@salonhub.com",
  "password": "Test123!"
}
```
- Tests (to save token):
```javascript
pm.environment.set("token", pm.response.json().token);
```

**Get Profile:**
- Method: GET
- URL: `{{baseUrl}}/api/profiles-service/profiles/me`
- Headers: `Authorization: Bearer {{token}}`

**Get Services:**
- Method: GET
- URL: `{{baseUrl}}/api/booking-service/services`
- Headers: `Authorization: Bearer {{token}}`

## Common Issues

### 401 Unauthorized
- **Cause**: Invalid or expired token
- **Solution**: Login again to get fresh token

### 503 Service Unavailable
- **Cause**: Microservice not running
- **Solution**: Check all services with `.\test-services.ps1`

### 500 Internal Server Error
- **Cause**: Database connection or code error
- **Solution**: Check service logs in terminals

### Token Validation Failing
- **Cause**: JWT_SECRET mismatch between backend and microservices
- **Solution**: Ensure all services use same JWT_SECRET from main backend

## Verification Checklist

- [ ] Can login and receive token
- [ ] Token validates at `/api/auth/verify`
- [ ] Can access Profile service endpoints
- [ ] Can access Booking service endpoints  
- [ ] Can access Payment service endpoints
- [ ] Profile CRUD operations work
- [ ] Booking CRUD operations work
- [ ] Payment operations work
- [ ] Follow/unfollow system works
- [ ] Timeline posts work
- [ ] Booking availability calculation works
- [ ] Stripe Connect integration works

## Next Steps

1. **Frontend Integration**
   - Use the API clients in `frontend/src/api/`
   - Implement UI components for each feature
   - Handle authentication in React

2. **Production Testing**
   - Test with production Stripe keys
   - Test webhook endpoints
   - Load testing
   - Security testing

3. **Monitoring**
   - Set up logging aggregation
   - Implement health checks dashboard
   - Set up alerts for service failures

## Support

For issues:
1. Check service logs in terminal windows
2. Review `MICROSERVICES_README.md`
3. Check MongoDB connection strings in `.env` files
4. Verify all services are running with `.\test-services.ps1`
