# SalonHub Microservices Startup Script
# This script starts all microservices in separate terminal windows

Write-Host "Starting SalonHub Microservices..." -ForegroundColor Cyan
Write-Host ""

$basePath = "c:\Users\narsh\Desktop\Directory-SalonHub\main-site\zip-directory"

# Start Main Backend
Write-Host "Starting Main Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\backend'; npm run dev"
Start-Sleep -Seconds 2

# Start Profile Service
Write-Host "Starting Profile Service (Port 6001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\services\profile-service'; npm run dev"
Start-Sleep -Seconds 2

# Start Booking Service
Write-Host "Starting Booking Service (Port 6002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\services\booking-service'; npm run dev"
Start-Sleep -Seconds 2

# Start Payment Service
Write-Host "Starting Payment Service (Port 6003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\services\payment-service'; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Please wait 10 seconds for services to initialize, then run test-services.ps1" -ForegroundColor Cyan
Write-Host ""
