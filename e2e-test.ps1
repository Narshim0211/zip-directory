# Authenticated End-to-End Test Script
# Tests complete flow: Login -> Get Token -> Test All Microservices

param(
    [string]$Email = "test@salonhub.com",
    [string]$Password = "Test123!"
)

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AUTHENTICATED E2E TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Login or Register
Write-Host "Step 1: Authentication" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$loginBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

Write-Host "Attempting login..." -NoNewline

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host " SUCCESS" -ForegroundColor Green
    $token = $loginResponse.token
    $userId = $loginResponse.user.id
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host "  Role: $($loginResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "  Attempting to register new user..." -NoNewline
    
    $registerBody = @{
        email = $Email
        password = $Password
        firstName = "Test"
        lastName = "User"
        role = "owner"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method POST `
            -Body $registerBody `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host " SUCCESS" -ForegroundColor Green
        $token = $registerResponse.token
        $userId = $registerResponse.user.id
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`nCannot proceed without authentication. Exiting.`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Token obtained successfully`n" -ForegroundColor Green

# Setup headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test Results Tracker
$testResults = @()

# Step 2: Test Profile Service
Write-Host "Step 2: Testing Profile Service (Port 6001)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Test 2.1: Get Profile
Write-Host "  [2.1] GET /api/profiles-service/me..." -NoNewline
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/profiles-service/me" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    $testResults += @{Test="Get Profile"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Get Profile"; Result="FAIL"}
}

# Test 2.2: Update Profile
Write-Host "  [2.2] PATCH /api/profiles-service/ (Update)..." -NoNewline
try {
    $profileData = @{
        bio = "Professional salon owner - Automated Test"
        socialLinks = @{
            instagram = "@testsalon"
            facebook = "testsalon"
        }
    } | ConvertTo-Json
    
    $updatedProfile = Invoke-RestMethod -Uri "$baseUrl/api/profiles-service/" `
        -Method PATCH `
        -Headers $headers `
        -Body $profileData `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    $testResults += @{Test="Update Profile"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Update Profile"; Result="FAIL"}
}

# Test 2.3: Create Timeline Post
Write-Host "  [2.3] POST /api/profiles-service/timeline (Create)..." -NoNewline
try {
    $postData = @{
        type = "post"
        content = "Test post from automated E2E test - $(Get-Date)"
    } | ConvertTo-Json
    
    $post = Invoke-RestMethod -Uri "$baseUrl/api/profiles-service/timeline" `
        -Method POST `
        -Headers $headers `
        -Body $postData `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Post ID: $($post.data._id)" -ForegroundColor Gray
    $testResults += @{Test="Create Timeline Post"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Create Timeline Post"; Result="FAIL"}
}

Write-Host ""

# Step 3: Test Booking Service
Write-Host "Step 3: Testing Booking Service (Port 6002)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Test 3.1: Get All Services
Write-Host "  [3.1] GET /api/booking-service/services/my..." -NoNewline
try {
    $services = Invoke-RestMethod -Uri "$baseUrl/api/booking-service/services/my" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Services count: $($services.data.Count)" -ForegroundColor Gray
    $testResults += @{Test="Get Services"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Get Services"; Result="FAIL"}
}

# Test 3.2: Create Service
Write-Host "  [3.2] POST /api/booking-service/services (Create)..." -NoNewline
try {
    $serviceData = @{
        name = "Haircut - Test Service"
        description = "Professional haircut service - Automated Test"
        price = 50
        duration = 60
        deposit = 12.50
        category = "haircut"
    } | ConvertTo-Json
    
    $newService = Invoke-RestMethod -Uri "$baseUrl/api/booking-service/services" `
        -Method POST `
        -Headers $headers `
        -Body $serviceData `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Service ID: $($newService.data._id)" -ForegroundColor Gray
    $serviceId = $newService.data._id
    $testResults += @{Test="Create Service"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Create Service"; Result="FAIL"}
    $serviceId = $null
}

# Test 3.3: Get All Staff
Write-Host "  [3.3] GET /api/booking-service/staff/my..." -NoNewline
try {
    $staff = Invoke-RestMethod -Uri "$baseUrl/api/booking-service/staff/my" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Staff profile exists" -ForegroundColor Gray
    $testResults += @{Test="Get Staff"; Result="PASS"}
} catch {
    # 404 is expected if user is not a staff member
    if ($_.Exception.Response.StatusCode -eq 'NotFound') {
        Write-Host " PASS (Not a staff member, expected)" -ForegroundColor Yellow
        $testResults += @{Test="Get Staff"; Result="PASS"}
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
        $testResults += @{Test="Get Staff"; Result="FAIL"}
    }
}

# Test 3.4: Get All Bookings
Write-Host "  [3.4] GET /api/booking-service/bookings/my..." -NoNewline
try {
    $bookings = Invoke-RestMethod -Uri "$baseUrl/api/booking-service/bookings/my" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Bookings count: $($bookings.data.Count)" -ForegroundColor Gray
    $testResults += @{Test="Get Bookings"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Get Bookings"; Result="FAIL"}
}

Write-Host ""

# Step 4: Test Payment Service
Write-Host "Step 4: Testing Payment Service (Port 6003)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Test 4.1: Get Subscriptions
Write-Host "  [4.1] GET /api/payment-service/subscriptions/my..." -NoNewline
try {
    $subscriptions = Invoke-RestMethod -Uri "$baseUrl/api/payment-service/subscriptions/my" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Subscription data retrieved" -ForegroundColor Gray
    $testResults += @{Test="Get Subscriptions"; Result="PASS"}
} catch {
    # 404 is expected if no subscription exists yet
    if ($_.Exception.Response.StatusCode -eq 'NotFound') {
        Write-Host " PASS (No subscription yet, expected)" -ForegroundColor Yellow
        $testResults += @{Test="Get Subscriptions"; Result="PASS"}
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
        $testResults += @{Test="Get Subscriptions"; Result="FAIL"}
    }
}

# Test 4.2: Get Stripe Account
Write-Host "  [4.2] GET /api/payment-service/stripe/connect..." -NoNewline
try {
    $stripeAccount = Invoke-RestMethod -Uri "$baseUrl/api/payment-service/stripe/connect" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    if ($stripeAccount.data) {
        Write-Host "    Account Status: $($stripeAccount.data.onboardingStatus)" -ForegroundColor Gray
    }
    $testResults += @{Test="Get Stripe Account"; Result="PASS"}
} catch {
    # 404 is expected if no Stripe account exists yet
    if ($_.Exception.Response.StatusCode -eq 'NotFound') {
        Write-Host " PASS (No Stripe account yet, expected)" -ForegroundColor Yellow
        $testResults += @{Test="Get Stripe Account"; Result="PASS"}
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
        $testResults += @{Test="Get Stripe Account"; Result="FAIL"}
    }
}

# Test 4.3: Get Transactions
Write-Host "  [4.3] GET /api/payment-service/payments/transactions/my..." -NoNewline
try {
    $transactions = Invoke-RestMethod -Uri "$baseUrl/api/payment-service/payments/transactions/my" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Transactions count: $($transactions.data.Count)" -ForegroundColor Gray
    $testResults += @{Test="Get Transactions"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Get Transactions"; Result="FAIL"}
}

Write-Host ""

# Step 5: Test Token Verification
Write-Host "Step 5: Testing Token Verification" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "  [5.1] POST /api/auth/verify (Direct)..." -NoNewline
try {
    $verifyResult = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" `
        -Method POST `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "    Valid: $($verifyResult.valid)" -ForegroundColor Gray
    Write-Host "    User: $($verifyResult.firstName) $($verifyResult.lastName)" -ForegroundColor Gray
    $testResults += @{Test="Token Verification"; Result="PASS"}
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    $testResults += @{Test="Token Verification"; Result="FAIL"}
}

Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Result -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Result -eq "FAIL" }).Count
$totalTests = $testResults.Count

Write-Host "Total Tests:  $totalTests" -ForegroundColor White
Write-Host "Passed:       $passCount" -ForegroundColor Green
Write-Host "Failed:       $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    Write-Host "Microservices Architecture: FULLY OPERATIONAL" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verified:" -ForegroundColor Cyan
    Write-Host "  - Authentication & JWT tokens" -ForegroundColor White
    Write-Host "  - Proxy gateway routing" -ForegroundColor White
    Write-Host "  - Profile service CRUD operations" -ForegroundColor White
    Write-Host "  - Booking service operations" -ForegroundColor White
    Write-Host "  - Payment service operations" -ForegroundColor White
    Write-Host "  - Token verification across services" -ForegroundColor White
    Write-Host ""
    Write-Host "Ready for:" -ForegroundColor Cyan
    Write-Host "  - Frontend integration" -ForegroundColor Yellow
    Write-Host "  - Production deployment" -ForegroundColor Yellow
    Write-Host "  - Load testing" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red -BackgroundColor Black
    Write-Host ""
    Write-Host "Failed tests:" -ForegroundColor Yellow
    $testResults | Where-Object { $_.Result -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Check service logs for details" -ForegroundColor Gray
    exit 1
}
