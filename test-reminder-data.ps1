# Test if reminders are being saved and retrieved

Write-Host "🧪 Testing Reminder Data Flow" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Start it with: node backend/server.js" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "2. Instructions to check reminder data:" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 STEP 1: Open MongoDB Compass or Mongo Shell" -ForegroundColor White
Write-Host "   Connect to: mongodb://localhost:27017" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 STEP 2: Run this query in visitor_time_tasks collection:" -ForegroundColor White
Write-Host '   db.visitor_time_tasks.find({ "reminder": { $exists: true, $ne: null } }).pretty()' -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 STEP 3: Check the output:" -ForegroundColor White
Write-Host "   ✅ GOOD: You see tasks with reminder: { time: '14:00', email: '...', phone: '...' }" -ForegroundColor Green
Write-Host "   ❌ BAD:  Empty result or reminder: null" -ForegroundColor Red
Write-Host ""
Write-Host "📋 STEP 4: Test the API directly with curl/Postman:" -ForegroundColor White
Write-Host '   GET http://localhost:5000/api/visitor/time-manager/daily?date=2025-11-15' -ForegroundColor Cyan
Write-Host ""
Write-Host "   Look for reminder field in the response:" -ForegroundColor Gray
Write-Host '   {' -ForegroundColor Gray
Write-Host '     "title": "Task Name",' -ForegroundColor Gray
Write-Host '     "reminder": {' -ForegroundColor Gray
Write-Host '       "time": "14:00",' -ForegroundColor Gray
Write-Host '       "email": "user@example.com"' -ForegroundColor Gray
Write-Host '     }' -ForegroundColor Gray
Write-Host '   }' -ForegroundColor Gray
Write-Host ""

# Try to make an API call to get tasks
Write-Host "3. Testing API call (requires auth token)..." -ForegroundColor Yellow
Write-Host "   Note: This will fail without authentication token" -ForegroundColor Gray
Write-Host ""

$currentDate = Get-Date -Format "yyyy-MM-dd"
Write-Host "   Testing URL: http://localhost:5000/api/visitor/time-manager/daily?date=$currentDate" -ForegroundColor Cyan

Write-Host ""
Write-Host "📊 DEBUGGING CHECKLIST:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ☐ Backend running on port 5000" -ForegroundColor White
Write-Host "   ☐ Create a task with reminder in UI" -ForegroundColor White
Write-Host "   ☐ Check browser DevTools → Network → POST request" -ForegroundColor White
Write-Host "   ☐ Verify request body has: reminder: { time, email, phone }" -ForegroundColor White
Write-Host "   ☐ Check MongoDB for saved task with reminder field" -ForegroundColor White
Write-Host "   ☐ Check browser DevTools → Network → GET request" -ForegroundColor White
Write-Host "   ☐ Verify response includes reminder field" -ForegroundColor White
Write-Host ""
Write-Host "🔧 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "   2. Go to Network tab" -ForegroundColor White
Write-Host "   3. Create a new task with reminder" -ForegroundColor White
Write-Host "   4. Look at the POST request payload" -ForegroundColor White
Write-Host "   5. Look at the GET request response" -ForegroundColor White
Write-Host "   6. Screenshot both and share for debugging" -ForegroundColor White
Write-Host ""
