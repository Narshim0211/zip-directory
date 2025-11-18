#!/usr/bin/env pwsh
# Start All Services for SalonHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting SalonHub Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the root directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Booking Service in a new window
Write-Host "1. Starting Booking Service (Port 6002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\services\booking-service'; Write-Host 'Booking Service' -ForegroundColor Cyan; npm start"

# Wait a moment
Start-Sleep -Seconds 2

# Start Main Backend in a new window
Write-Host "2. Starting Main Backend (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host 'Main Backend' -ForegroundColor Cyan; npm start"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend in a new window
Write-Host "3. Starting Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; Write-Host 'Frontend' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All services are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  - Booking Service: http://localhost:6002" -ForegroundColor White
Write-Host "  - Main Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend:        http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Keep all PowerShell windows open!" -ForegroundColor Red
Write-Host ""
