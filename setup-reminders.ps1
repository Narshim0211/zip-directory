#!/usr/bin/env pwsh
# ================================================
# SalonHub Reminder System Setup Script
# ================================================
# This script helps you configure email and SMS reminders

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SalonHub Reminder System Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendEnvPath = ".\backend\.env"

# Check if .env exists
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "❌ Backend .env file not found!" -ForegroundColor Red
    Write-Host "`nCreating from template..." -ForegroundColor Yellow
    
    if (Test-Path ".\backend\.env.template") {
        Copy-Item ".\backend\.env.template" $backendEnvPath
        Write-Host "✅ Created backend/.env from template" -ForegroundColor Green
    } else {
        Write-Host "❌ Template file not found. Please create backend/.env manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "📋 Current Reminder Configuration:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Check current status
$envContent = Get-Content $backendEnvPath -Raw

$sendgridConfigured = $envContent -match 'SENDGRID_API_KEY=(?!your_sendgrid_api_key_here)(.+)' -and $matches[1] -notmatch '^#'
$twilioConfigured = ($envContent -match 'TWILIO_SID=(?!your_twilio_account_sid)(.+)' -and $matches[1] -notmatch '^#') -and 
                     ($envContent -match 'TWILIO_TOKEN=(?!your_twilio_auth_token)(.+)' -and $matches[1] -notmatch '^#')

if ($sendgridConfigured) {
    Write-Host "✅ Email (SendGrid): CONFIGURED" -ForegroundColor Green
} else {
    Write-Host "❌ Email (SendGrid): NOT CONFIGURED" -ForegroundColor Red
}

if ($twilioConfigured) {
    Write-Host "✅ SMS (Twilio): CONFIGURED" -ForegroundColor Green
} else {
    Write-Host "❌ SMS (Twilio): NOT CONFIGURED" -ForegroundColor Red
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Ask user what they want to configure
Write-Host "What would you like to configure?" -ForegroundColor Yellow
Write-Host "1) Email reminders (SendGrid)" -ForegroundColor White
Write-Host "2) SMS reminders (Twilio)" -ForegroundColor White
Write-Host "3) Both" -ForegroundColor White
Write-Host "4) Test current configuration" -ForegroundColor White
Write-Host "5) Exit" -ForegroundColor White

$choice = Read-Host "`nYour choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n📧 Configuring Email Reminders (SendGrid)" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
        
        Write-Host "📝 You'll need:" -ForegroundColor Yellow
        Write-Host "   • SendGrid API Key (from https://app.sendgrid.com/settings/api_keys)" -ForegroundColor White
        Write-Host "   • Sender email address`n" -ForegroundColor White
        
        $apiKey = Read-Host "Enter your SendGrid API Key"
        $senderEmail = Read-Host "Enter sender email (e.g., noreply@yourdomain.com)"
        
        # Update .env
        $envContent = $envContent -replace 'SENDGRID_API_KEY=.*', "SENDGRID_API_KEY=$apiKey"
        $envContent = $envContent -replace 'SENDER_EMAIL=.*', "SENDER_EMAIL=$senderEmail"
        
        Set-Content $backendEnvPath $envContent
        Write-Host "`n✅ Email configuration saved!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host "`n📱 Configuring SMS Reminders (Twilio)" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
        
        Write-Host "📝 You'll need:" -ForegroundColor Yellow
        Write-Host "   • Twilio Account SID (from https://console.twilio.com/)" -ForegroundColor White
        Write-Host "   • Twilio Auth Token" -ForegroundColor White
        Write-Host "   • Twilio Phone Number (format: +1234567890)`n" -ForegroundColor White
        
        $sid = Read-Host "Enter your Twilio Account SID"
        $token = Read-Host "Enter your Twilio Auth Token"
        $phone = Read-Host "Enter your Twilio Phone Number (with country code)"
        
        # Update .env
        $envContent = $envContent -replace 'TWILIO_SID=.*', "TWILIO_SID=$sid"
        $envContent = $envContent -replace 'TWILIO_TOKEN=.*', "TWILIO_TOKEN=$token"
        $envContent = $envContent -replace 'TWILIO_PHONE=.*', "TWILIO_PHONE=$phone"
        
        Set-Content $backendEnvPath $envContent
        Write-Host "`n✅ SMS configuration saved!" -ForegroundColor Green
    }
    
    "3" {
        Write-Host "`n📧📱 Configuring Both Email & SMS" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
        
        # SendGrid
        Write-Host "`n📧 SendGrid Configuration:" -ForegroundColor Yellow
        $apiKey = Read-Host "Enter your SendGrid API Key"
        $senderEmail = Read-Host "Enter sender email"
        
        # Twilio
        Write-Host "`n📱 Twilio Configuration:" -ForegroundColor Yellow
        $sid = Read-Host "Enter your Twilio Account SID"
        $token = Read-Host "Enter your Twilio Auth Token"
        $phone = Read-Host "Enter your Twilio Phone Number (with country code)"
        
        # Update .env
        $envContent = $envContent -replace 'SENDGRID_API_KEY=.*', "SENDGRID_API_KEY=$apiKey"
        $envContent = $envContent -replace 'SENDER_EMAIL=.*', "SENDER_EMAIL=$senderEmail"
        $envContent = $envContent -replace 'TWILIO_SID=.*', "TWILIO_SID=$sid"
        $envContent = $envContent -replace 'TWILIO_TOKEN=.*', "TWILIO_TOKEN=$token"
        $envContent = $envContent -replace 'TWILIO_PHONE=.*', "TWILIO_PHONE=$phone"
        
        Set-Content $backendEnvPath $envContent
        Write-Host "`n✅ Email & SMS configuration saved!" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "`n🧪 Testing Configuration..." -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
        
        # Test by checking environment variables
        Push-Location backend
        
        $testEmail = Read-Host "Enter email to test (or press Enter to skip)"
        $testPhone = Read-Host "Enter phone to test in +1234567890 format (or press Enter to skip)"
        
        Write-Host "`n📤 Attempting to send test reminders..." -ForegroundColor Yellow
        
        # Create a test task reminder
        $testScript = @"
require('dotenv').config();
const { sendReminder } = require('./shared/utils/sendReminder');

const testTask = {
    _id: 'test-task-id',
    title: 'TEST: Reminder System Check',
    description: 'This is a test reminder from SalonHub setup script.',
    taskDate: new Date(),
    reminder: {
        time: '12:00',
        email: '$testEmail',
        phone: '$testPhone'
    }
};

sendReminder(testTask)
    .then(result => {
        console.log('\n✅ Test Results:');
        console.log('Email sent:', result.emailSent ? '✅' : '❌');
        console.log('SMS sent:', result.smsSent ? '✅' : '❌');
        if (!result.success) {
            console.log('\nErrors:', result.results);
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    });
"@
        
        Set-Content -Path "test-reminder.js" -Value $testScript
        node test-reminder.js
        Remove-Item "test-reminder.js"
        
        Pop-Location
    }
    
    "5" {
        Write-Host "`n👋 Exiting setup..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server for changes to take effect" -ForegroundColor White
Write-Host "2. The reminder scheduler runs automatically every minute" -ForegroundColor White
Write-Host "3. Create a task with a reminder to test" -ForegroundColor White
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
