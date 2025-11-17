# Quick Test Script - Weekly/Monthly Task Fix

Write-Host "[TEST] Weekly & Monthly Task Creation Fix" -ForegroundColor Cyan
Write-Host ""

# Check if files were modified correctly
Write-Host "[1] Checking modified files..." -ForegroundColor Yellow
Write-Host ""

$weeklyFile = "frontend\src\features\timeManager\pages\visitor\WeeklyView.jsx"
$monthlyFile = "frontend\src\features\timeManager\pages\visitor\MonthlyView.jsx"

# Check WeeklyView
Write-Host "Checking $weeklyFile" -ForegroundColor White
if (Test-Path $weeklyFile) {
    $content = Get-Content $weeklyFile -Raw
    
    if ($content -match "api\.createWeekly\(") {
        Write-Host "   [OK] WeeklyView uses api.createWeekly()" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] WeeklyView does NOT use api.createWeekly()" -ForegroundColor Red
    }
    
    if ($content -match "api\.createTask\(") {
        Write-Host "   [WARNING] WeeklyView still has api.createTask()" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERROR] File not found" -ForegroundColor Red
}

Write-Host ""

# Check MonthlyView
Write-Host "Checking $monthlyFile" -ForegroundColor White
if (Test-Path $monthlyFile) {
    $content = Get-Content $monthlyFile -Raw
    
    if ($content -match "api\.createMonthly\(") {
        Write-Host "   [OK] MonthlyView uses api.createMonthly()" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] MonthlyView does NOT use api.createMonthly()" -ForegroundColor Red
    }
    
    if ($content -match "api\.createTask\(") {
        Write-Host "   [WARNING] MonthlyView still has api.createTask()" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERROR] File not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend routes exist
Write-Host "[2] Checking Backend Routes..." -ForegroundColor Yellow
Write-Host ""

$backendRoutes = "backend\visitor\time\routes\timeRoutes.js"
if (Test-Path $backendRoutes) {
    $routeContent = Get-Content $backendRoutes -Raw
    
    if ($routeContent -match 'router\.post\("/weekly') {
        Write-Host "   [OK] POST /weekly route exists" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] POST /weekly route MISSING" -ForegroundColor Red
    }
    
    if ($routeContent -match 'router\.post\("/monthly') {
        Write-Host "   [OK] POST /monthly route exists" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] POST /monthly route MISSING" -ForegroundColor Red
    }
} else {
    Write-Host "   [WARNING] Backend route file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if useTimeManagerApi has correct methods
Write-Host "[3] Checking API Hook..." -ForegroundColor Yellow
Write-Host ""

$apiHook = "frontend\src\features\timeManager\hooks\useTimeManagerApi.js"
if (Test-Path $apiHook) {
    $hookContent = Get-Content $apiHook -Raw
    
    if ($hookContent -match "createWeekly") {
        Write-Host "   [OK] createWeekly() method defined" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] createWeekly() method MISSING" -ForegroundColor Red
    }
    
    if ($hookContent -match "createMonthly") {
        Write-Host "   [OK] createMonthly() method defined" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] createMonthly() method MISSING" -ForegroundColor Red
    }
    
    if ($hookContent -match "createDaily") {
        Write-Host "   [OK] createDaily() method defined" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] createDaily() method MISSING" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERROR] API hook file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[SUMMARY]" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed [OK], your fix is complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart frontend: cd frontend && npm start"
Write-Host "2. Test Weekly task creation"
Write-Host "3. Test Monthly task creation"
Write-Host "4. Check browser Network tab for POST requests"
Write-Host ""
Write-Host "See WEEKLY_TASK_BUG_FIX_COMPLETE.md for detailed testing" -ForegroundColor Cyan
