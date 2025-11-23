@echo off
REM SalonHub Frontend Cleanup Script
REM Generated: 2025-11-23
REM This script safely removes duplicate and orphaned components

echo ============================================
echo   SalonHub Frontend Cleanup Script
echo ============================================
echo.

REM Step 1: Create backup directory
echo [1/3] Creating backup directory...
if not exist "frontend_backup_2025-11-23" mkdir "frontend_backup_2025-11-23"
echo ✓ Backup directory created
echo.

REM Step 2: Backup files before deletion
echo [2/3] Backing up files to be deleted...

if exist "frontend\src\components\SharedComponents\FollowButton.jsx" (
    copy "frontend\src\components\SharedComponents\FollowButton.jsx" "frontend_backup_2025-11-23\FollowButton_SharedComponents.jsx" >nul
    echo ✓ Backed up: SharedComponents/FollowButton.jsx
)

if exist "frontend\src\visitor\components\FollowButton.jsx" (
    copy "frontend\src\visitor\components\FollowButton.jsx" "frontend_backup_2025-11-23\FollowButton_visitor.jsx" >nul
    echo ✓ Backed up: visitor/components/FollowButton.jsx
)

if exist "frontend\src\components\ErrorBoundary.jsx" (
    copy "frontend\src\components\ErrorBoundary.jsx" "frontend_backup_2025-11-23\ErrorBoundary_components.jsx" >nul
    echo ✓ Backed up: components/ErrorBoundary.jsx
)

if exist "frontend\src\features\timeManager\components\ErrorBoundary.jsx" (
    copy "frontend\src\features\timeManager\components\ErrorBoundary.jsx" "frontend_backup_2025-11-23\ErrorBoundary_timeManager.jsx" >nul
    echo ✓ Backed up: features/timeManager/components/ErrorBoundary.jsx
)

if exist "frontend\src\shared\timeManager\components\ErrorBoundary.jsx" (
    copy "frontend\src\shared\timeManager\components\ErrorBoundary.jsx" "frontend_backup_2025-11-23\ErrorBoundary_shared.jsx" >nul
    echo ✓ Backed up: shared/timeManager/components/ErrorBoundary.jsx
)

if exist "frontend\src\shared\timeManager\components\TaskCard.jsx" (
    copy "frontend\src\shared\timeManager\components\TaskCard.jsx" "frontend_backup_2025-11-23\TaskCard_shared.jsx" >nul
    echo ✓ Backed up: shared/timeManager/components/TaskCard.jsx
)

if exist "frontend\src\components\NavBar.js" (
    copy "frontend\src\components\NavBar.js" "frontend_backup_2025-11-23\NavBar.js" >nul
    echo ✓ Backed up: components/NavBar.js
)

if exist "frontend\src\components\SmartFollowButton.jsx" (
    copy "frontend\src\components\SmartFollowButton.jsx" "frontend_backup_2025-11-23\SmartFollowButton.jsx" >nul
    echo ✓ Backed up: components/SmartFollowButton.jsx
)

echo.
echo All files backed up to: frontend_backup_2025-11-23\
echo.

REM Step 3: Delete orphaned files
echo [3/3] Deleting orphaned and duplicate files...

if exist "frontend\src\components\SharedComponents\FollowButton.jsx" (
    del "frontend\src\components\SharedComponents\FollowButton.jsx"
    echo ✓ Deleted: SharedComponents/FollowButton.jsx
)

if exist "frontend\src\visitor\components\FollowButton.jsx" (
    del "frontend\src\visitor\components\FollowButton.jsx"
    echo ✓ Deleted: visitor/components/FollowButton.jsx
)

if exist "frontend\src\components\ErrorBoundary.jsx" (
    del "frontend\src\components\ErrorBoundary.jsx"
    echo ✓ Deleted: components/ErrorBoundary.jsx
)

if exist "frontend\src\features\timeManager\components\ErrorBoundary.jsx" (
    del "frontend\src\features\timeManager\components\ErrorBoundary.jsx"
    echo ✓ Deleted: features/timeManager/components/ErrorBoundary.jsx
)

if exist "frontend\src\shared\timeManager\components\ErrorBoundary.jsx" (
    del "frontend\src\shared\timeManager\components\ErrorBoundary.jsx"
    echo ✓ Deleted: shared/timeManager/components/ErrorBoundary.jsx
)

if exist "frontend\src\shared\timeManager\components\TaskCard.jsx" (
    del "frontend\src\shared\timeManager\components\TaskCard.jsx"
    echo ✓ Deleted: shared/timeManager/components/TaskCard.jsx
)

if exist "frontend\src\components\NavBar.js" (
    del "frontend\src\components\NavBar.js"
    echo ✓ Deleted: components/NavBar.js
)

if exist "frontend\src\components\SmartFollowButton.jsx" (
    del "frontend\src\components\SmartFollowButton.jsx"
    echo ✓ Deleted: components/SmartFollowButton.jsx
)

echo.
echo ============================================
echo   Cleanup Complete!
echo ============================================
echo.
echo Files deleted: 8
echo Backup location: frontend_backup_2025-11-23\
echo.
echo Next steps:
echo 1. Run: cd frontend
echo 2. Run: npm start
echo 3. Verify app compiles successfully
echo.
echo If anything breaks, restore from backup:
echo    copy frontend_backup_2025-11-23\*.jsx frontend\src\components\
echo.
pause
