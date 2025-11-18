#!/usr/bin/env pwsh
# Start Booking Service
Write-Host "Starting Booking Service on port 6002..." -ForegroundColor Cyan
Set-Location "services\booking-service"
npm start
