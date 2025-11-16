# 🔍 Complete Reminder System Diagnostic

Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔬 REMINDER SYSTEM COMPLETE DIAGNOSTIC" -ForegroundColor White
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check backend
Write-Host "STEP 1: Checking Backend Status" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

try {
    $backend = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Start it with: cd backend; node server.js" -ForegroundColor Gray
    exit
}

Write-Host ""
Write-Host "STEP 2: Testing Instructions" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "Now perform these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣  Create a new task with reminder:" -ForegroundColor Cyan
Write-Host "    • Open Time Manager → Daily view" -ForegroundColor Gray
Write-Host "    • Click '+ Task'" -ForegroundColor Gray
Write-Host "    • Fill in title: 'Test Reminder Task'" -ForegroundColor Gray
Write-Host "    • Check 'Set Reminder'" -ForegroundColor Gray
Write-Host "    • Set time: 14:00" -ForegroundColor Gray
Write-Host "    • Add email: test@example.com" -ForegroundColor Gray
Write-Host "    • Click 'Save'" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Watch BACKEND CONSOLE for these logs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Expected output:" -ForegroundColor White
Write-Host "    ─────────────────" -ForegroundColor Gray
Write-Host '    📝 CREATE TASK REQUEST:' -ForegroundColor Gray
Write-Host '      - Title: Test Reminder Task' -ForegroundColor Gray
Write-Host '      - Reminder payload: { time: "14:00", email: "test@example.com" }' -ForegroundColor Gray
Write-Host '    📦 Final payload being saved:' -ForegroundColor Gray
Write-Host '    ✅ Task created in database:' -ForegroundColor Gray
Write-Host '      - Reminder in DB: { time: "14:00", ... }' -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Refresh the page and check backend console:" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Expected output:" -ForegroundColor White
Write-Host "    ─────────────────" -ForegroundColor Gray
Write-Host '    🔍 Fetching daily tasks for user: ...' -ForegroundColor Gray
Write-Host '    🔎 Task query: { scope: "daily", dateRange: "..." }' -ForegroundColor Gray
Write-Host '    📋 Found X tasks matching query' -ForegroundColor Gray
Write-Host '    Task 1: "Test Reminder Task" - reminder: YES' -ForegroundColor Gray
Write-Host '      → Reminder details: { time: "14:00", ... }' -ForegroundColor Gray
Write-Host '    📊 Summary: 1 tasks have reminders' -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Check BROWSER CONSOLE (F12 → Console):" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Expected output:" -ForegroundColor White
Write-Host "    ─────────────────" -ForegroundColor Gray
Write-Host '    📥 Received X tasks from API' -ForegroundColor Gray
Write-Host '    📬 Tasks with reminders: 1' -ForegroundColor Gray
Write-Host '    Sample reminder: { time: "14:00", email: "test@example.com" }' -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  Check BROWSER NETWORK TAB (F12 → Network):" -ForegroundColor Cyan
Write-Host ""
Write-Host "    • Refresh page" -ForegroundColor Gray
Write-Host "    • Find GET request to: /api/visitor/time-manager/daily" -ForegroundColor Gray
Write-Host "    • Click on it → Preview tab" -ForegroundColor Gray
Write-Host "    • Look for reminder field in task objects" -ForegroundColor Gray
Write-Host ""
Write-Host "    ✅ GOOD: reminder: { time: '14:00', email: '...' }" -ForegroundColor Green
Write-Host "    ❌ BAD:  reminder: null OR missing" -ForegroundColor Red
Write-Host ""

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 DIAGNOSTIC SCENARIOS" -ForegroundColor White
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "SCENARIO A: Backend shows 'Reminder in DB: NULL'" -ForegroundColor Yellow
Write-Host "  → Problem: Reminder not being saved to database" -ForegroundColor Red
Write-Host "  → Check: Task schema includes reminder field" -ForegroundColor Gray
Write-Host "  → Check: Frontend sending correct payload" -ForegroundColor Gray
Write-Host ""

Write-Host "SCENARIO B: Backend saves reminder but GET returns 0 tasks" -ForegroundColor Yellow
Write-Host "  → Problem: Date query not matching saved tasks" -ForegroundColor Red
Write-Host "  → Fixed: Using date range query now" -ForegroundColor Green
Write-Host "  → Check: taskDate field in database" -ForegroundColor Gray
Write-Host ""

Write-Host "SCENARIO C: Backend returns tasks but no reminders" -ForegroundColor Yellow
Write-Host "  → Problem: Tasks saved without reminder field" -ForegroundColor Red
Write-Host "  → Check: MongoDB document structure" -ForegroundColor Gray
Write-Host "  → Check: Mongoose schema definition" -ForegroundColor Gray
Write-Host ""

Write-Host "SCENARIO D: Frontend receives 0 tasks with reminders" -ForegroundColor Yellow
Write-Host "  → Problem: API response missing reminder data" -ForegroundColor Red
Write-Host "  → Check: Network tab response JSON" -ForegroundColor Gray
Write-Host "  → Check: Axios interceptor not removing fields" -ForegroundColor Gray
Write-Host ""

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔧 QUICK FIXES" -ForegroundColor White
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "If reminders still don't show:" -ForegroundColor White
Write-Host ""
Write-Host "1. Check MongoDB directly:" -ForegroundColor Cyan
Write-Host '   mongosh "mongodb://localhost:27017/salonhub"' -ForegroundColor Gray
Write-Host '   db.visitor_time_tasks.find({ reminder: { $ne: null } }).pretty()' -ForegroundColor Gray
Write-Host ""

Write-Host "2. Clear all tasks and start fresh:" -ForegroundColor Cyan
Write-Host '   db.visitor_time_tasks.deleteMany({})' -ForegroundColor Gray
Write-Host ""

Write-Host "3. Check task schema file:" -ForegroundColor Cyan
Write-Host '   backend/shared/timeTaskSchema.js' -ForegroundColor Gray
Write-Host '   Should have: reminder: { time: String, email: String, ... }' -ForegroundColor Gray
Write-Host ""

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ NEXT STEPS" -ForegroundColor White
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Follow the testing steps above" -ForegroundColor White
Write-Host "2. Share screenshots of:" -ForegroundColor White
Write-Host "   • Backend console logs" -ForegroundColor Gray
Write-Host "   • Browser console logs" -ForegroundColor Gray
Write-Host "   • Network tab response" -ForegroundColor Gray
Write-Host ""
Write-Host "This will identify the EXACT point where reminder data is lost!" -ForegroundColor Cyan
Write-Host ""
