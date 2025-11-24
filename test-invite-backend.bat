@echo off
echo ============================================
echo Testing SalonHub Invite System Backend
echo ============================================
echo.

echo Test 1: Checking if backend is running...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend is running on port 5000
) else (
    echo [FAIL] Backend is NOT running! Start it with: cd backend ^&^& npm start
    pause
    exit /b 1
)
echo.

echo Test 2: Checking if /api/invite endpoint exists...
curl -X POST http://localhost:5000/api/invite -H "Content-Type: application/json" -d "{\"recipientEmail\":\"test@example.com\"}" 2>nul | findstr "401\|Unauthorized\|required" >nul
if %errorlevel% == 0 (
    echo [OK] Invite endpoint exists (returned auth error as expected)
) else (
    echo [WARN] Invite endpoint might not be registered correctly
)
echo.

echo Test 3: Checking if /api/invite/stats endpoint exists...
curl -s http://localhost:5000/api/invite/stats 2>nul | findstr "401\|Unauthorized" >nul
if %errorlevel% == 0 (
    echo [OK] Stats endpoint exists (returned auth error as expected)
) else (
    echo [WARN] Stats endpoint might not be registered correctly
)
echo.

echo ============================================
echo Summary:
echo - If you see [OK] for all tests, backend is ready!
echo - Next: Navigate to your profile to see invite button
echo ============================================
echo.

pause
