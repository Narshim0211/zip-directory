# SalonHub Microservices System Test
# This script tests all microservices are running and responding

Write-Host "================================" -ForegroundColor Cyan
Write-Host "SalonHub Microservices Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Main Backend"; Port=5000; Endpoint="http://localhost:5000/health"},
    @{Name="Profile Service"; Port=6001; Endpoint="http://localhost:6001/health"},
    @{Name="Booking Service"; Port=6002; Endpoint="http://localhost:6002/health"},
    @{Name="Payment Service"; Port=6003; Endpoint="http://localhost:6003/health"}
)

$allPassed = $true

# Test 1: Check if ports are listening
Write-Host "Test 1: Checking if services are running on correct ports..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($connection) {
            Write-Host "✓ $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
        } else {
            Write-Host "✗ $($service.Name) is NOT running on port $($service.Port)" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "✗ $($service.Name) is NOT running on port $($service.Port)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

# Test 2: Check if services respond to health checks
Write-Host "Test 2: Testing health endpoints..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Endpoint -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $($service.Name) health check passed (200 OK)" -ForegroundColor Green
        } else {
            Write-Host "✗ $($service.Name) health check failed (Status: $($response.StatusCode))" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "✗ $($service.Name) health check failed: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

# Test 3: Test authentication endpoint
Write-Host "Test 3: Testing authentication endpoint..." -ForegroundColor Yellow
Write-Host ""

try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/verify" -Method POST -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "Note: Auth endpoint requires valid token (401 expected without token)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "✓ Auth endpoint is working (401 Unauthorized as expected)" -ForegroundColor Green
    } else {
        Write-Host "✗ Auth endpoint error: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "✓ All tests passed! Microservices are running correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "System Status:" -ForegroundColor Cyan
    Write-Host "  Main Backend (Port 5000):    ✓ Running" -ForegroundColor Green
    Write-Host "  Profile Service (Port 6001): ✓ Running" -ForegroundColor Green
    Write-Host "  Booking Service (Port 6002): ✓ Running" -ForegroundColor Green
    Write-Host "  Payment Service (Port 6003): ✓ Running" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready for integration testing!" -ForegroundColor Cyan
} else {
    Write-Host "✗ Some tests failed. Please check the services." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check if all services are started in separate terminals" -ForegroundColor Gray
    Write-Host "2. Verify MongoDB connections in .env files" -ForegroundColor Gray
    Write-Host "3. Check for port conflicts" -ForegroundColor Gray
    Write-Host "4. Review service logs for errors" -ForegroundColor Gray
}

Write-Host ""
Write-Host "For more information, see MICROSERVICES_README.md" -ForegroundColor Cyan
Write-Host ""
