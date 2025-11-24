#!/usr/bin/env pwsh
# SalonHub - Start Servers and Verify

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 SalonHub Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use
Write-Host "Checking for port conflicts..." -ForegroundColor Yellow

$backend5000 = netstat -ano | findstr ":5000" | Select-String "LISTENING"
$frontend3000 = netstat -ano | findstr ":3000" | Select-String "LISTENING"

if ($backend5000) {
    Write-Host "⚠️  Port 5000 is already in use!" -ForegroundColor Red
    Write-Host "   Kill the process first or backend won't start." -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit }
}

if ($frontend3000) {
    Write-Host "⚠️  Port 3000 is already in use!" -ForegroundColor Red
    Write-Host "   Kill the process first or frontend won't start." -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit }
}

Write-Host "✓ Ports are available" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1️⃣  Starting Backend (Port 5000)..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'SalonHub Backend - Port 5000'
cd '$PSScriptRoot\backend'
Write-Host '🚀 Starting Backend Server...' -ForegroundColor Cyan
npm start
"@ -PassThru

Start-Sleep -Seconds 3

# Verify backend started
$backendRunning = netstat -ano | findstr ":5000" | Select-String "LISTENING"
if ($backendRunning) {
    Write-Host "✅ Backend is running on port 5000!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend failed to start on port 5000" -ForegroundColor Red
    Write-Host "   Check the backend terminal for errors" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "2️⃣  Starting Frontend (Port 3000)..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$host.UI.RawUI.WindowTitle = 'SalonHub Frontend - Port 3000'
cd '$PSScriptRoot\frontend'
Write-Host '⚡ Starting Frontend Dev Server...' -ForegroundColor Cyan
npm start
"@ -PassThru

Start-Sleep -Seconds 5

# Verify frontend started
$frontendRunning = netstat -ano | findstr ":3000" | Select-String "LISTENING"
if ($frontendRunning) {
    Write-Host "✅ Frontend is running on port 3000!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend failed to start on port 3000" -ForegroundColor Red
    Write-Host "   Check the frontend terminal for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your browser to: http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Press F12 to open DevTools Console" -ForegroundColor White
Write-Host "3. Try to login" -ForegroundColor White
Write-Host "4. Look for: 🌐 [AXIOS] POST http://localhost:5000/api/auth/login" -ForegroundColor White
Write-Host ""
Write-Host "✅ If you see the 🌐 [AXIOS] log: Everything is working!" -ForegroundColor Green
Write-Host "❌ If you see ERR_CONNECTION_REFUSED: Servers didn't start (check terminals)" -ForegroundColor Red
Write-Host "❌ If you see 404: Route configuration issue (check backend)" -ForegroundColor Red
Write-Host ""
Write-Host "Keep both terminal windows open!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to see final port check..."
Read-Host

# Final verification
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Final Port Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$final5000 = netstat -ano | findstr ":5000" | Select-String "LISTENING"
$final3000 = netstat -ano | findstr ":3000" | Select-String "LISTENING"

if ($final5000) {
    Write-Host "✅ Backend: RUNNING on port 5000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: NOT RUNNING on port 5000" -ForegroundColor Red
}

if ($final3000) {
    Write-Host "✅ Frontend: RUNNING on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: NOT RUNNING on port 3000" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 Open http://localhost:3000 now!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
