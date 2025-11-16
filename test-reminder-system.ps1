# ===================================
# Reminder System Test Script
# ===================================

Write-Host "`n🧪 REMINDER SYSTEM TESTING SUITE" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$BackendUrl = "http://localhost:5000"

# Test 1: Check if backend is running
Write-Host "📡 Test 1: Checking backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/api/test" -Method Get
    if ($response.success) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is not running. Start it with 'npm start' in backend folder" -ForegroundColor Red
    exit 1
}

# Test 2: Trigger manual reminder check
Write-Host "`n🔔 Test 2: Triggering manual reminder check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/api/reminders/test" -Method Post
    Write-Host "✅ Manual check triggered at: $($response.timestamp)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to trigger reminder check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check environment variables
Write-Host "`n🔑 Test 3: Checking environment configuration..." -ForegroundColor Yellow

$envPath = "..\..\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    $hasEmail = $envContent -match "SENDGRID_API_KEY=SG\."
    $hasSender = $envContent -match "SENDER_EMAIL=.+@"
    $hasTwilioSid = $envContent -match "TWILIO_SID=AC"
    $hasTwilioToken = $envContent -match "TWILIO_TOKEN=.+"
    $hasTwilioPhone = $envContent -match "TWILIO_PHONE=\+"
    
    if ($hasEmail -and $hasSender) {
        Write-Host "✅ SendGrid configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SendGrid not configured - emails won't be sent" -ForegroundColor Yellow
    }
    
    if ($hasTwilioSid -and $hasTwilioToken -and $hasTwilioPhone) {
        Write-Host "✅ Twilio configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Twilio not configured - SMS won't be sent" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .env file not found - create one from .env.example" -ForegroundColor Yellow
}

# Test 4: Get current time
Write-Host "`n⏰ Test 4: Current server time..." -ForegroundColor Yellow
$currentTime = Get-Date -Format "HH:mm"
Write-Host "Current time: $currentTime (24-hour format)" -ForegroundColor Cyan
Write-Host "💡 Set reminder to: $currentTime to test immediately" -ForegroundColor Cyan

# Instructions
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host "1. Go to Time Manager (http://localhost:3000/visitor/time)" -ForegroundColor White
Write-Host "2. Create a new task" -ForegroundColor White
Write-Host "3. Enable reminder and set time to: $currentTime" -ForegroundColor White
Write-Host "4. Add your email and/or phone number" -ForegroundColor White
Write-Host "5. Save the task" -ForegroundColor White
Write-Host "6. Wait 1-2 minutes - you should receive the notification!" -ForegroundColor White
Write-Host "`n✨ Check backend console for logs like:" -ForegroundColor Cyan
Write-Host "   🔍 Checking reminders at $currentTime..." -ForegroundColor Gray
Write-Host "   📬 Found 1 reminder(s) to send" -ForegroundColor Gray
Write-Host "   ✅ Email/SMS sent successfully`n" -ForegroundColor Gray

Write-Host "🎉 Test suite complete!`n" -ForegroundColor Green
