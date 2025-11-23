@echo off
REM SalonHub Frontend Cleanup Rollback Script
REM Generated: 2025-11-23
REM This script restores all deleted files from backup

echo ============================================
echo   SalonHub Cleanup Rollback Script
echo ============================================
echo.

if not exist "frontend_backup_2025-11-23" (
    echo ERROR: Backup directory not found!
    echo Cannot rollback without backup.
    pause
    exit /b 1
)

echo WARNING: This will restore all deleted files from backup.
echo.
set /p confirm="Are you sure? (Y/N): "

if /i not "%confirm%"=="Y" (
    echo Rollback cancelled.
    pause
    exit /b 0
)

echo.
echo [1/1] Restoring files from backup...
echo.

if exist "frontend_backup_2025-11-23\FollowButton_SharedComponents.jsx" (
    if not exist "frontend\src\components\SharedComponents" mkdir "frontend\src\components\SharedComponents"
    copy "frontend_backup_2025-11-23\FollowButton_SharedComponents.jsx" "frontend\src\components\SharedComponents\FollowButton.jsx" >nul
    echo ✓ Restored: SharedComponents/FollowButton.jsx
)

if exist "frontend_backup_2025-11-23\FollowButton_visitor.jsx" (
    if not exist "frontend\src\visitor\components" mkdir "frontend\src\visitor\components"
    copy "frontend_backup_2025-11-23\FollowButton_visitor.jsx" "frontend\src\visitor\components\FollowButton.jsx" >nul
    echo ✓ Restored: visitor/components/FollowButton.jsx
)

if exist "frontend_backup_2025-11-23\ErrorBoundary_components.jsx" (
    copy "frontend_backup_2025-11-23\ErrorBoundary_components.jsx" "frontend\src\components\ErrorBoundary.jsx" >nul
    echo ✓ Restored: components/ErrorBoundary.jsx
)

if exist "frontend_backup_2025-11-23\ErrorBoundary_timeManager.jsx" (
    if not exist "frontend\src\features\timeManager\components" mkdir "frontend\src\features\timeManager\components"
    copy "frontend_backup_2025-11-23\ErrorBoundary_timeManager.jsx" "frontend\src\features\timeManager\components\ErrorBoundary.jsx" >nul
    echo ✓ Restored: features/timeManager/components/ErrorBoundary.jsx
)

if exist "frontend_backup_2025-11-23\ErrorBoundary_shared.jsx" (
    if not exist "frontend\src\shared\timeManager\components" mkdir "frontend\src\shared\timeManager\components"
    copy "frontend_backup_2025-11-23\ErrorBoundary_shared.jsx" "frontend\src\shared\timeManager\components\ErrorBoundary.jsx" >nul
    echo ✓ Restored: shared/timeManager/components/ErrorBoundary.jsx
)

if exist "frontend_backup_2025-11-23\TaskCard_shared.jsx" (
    if not exist "frontend\src\shared\timeManager\components" mkdir "frontend\src\shared\timeManager\components"
    copy "frontend_backup_2025-11-23\TaskCard_shared.jsx" "frontend\src\shared\timeManager\components\TaskCard.jsx" >nul
    echo ✓ Restored: shared/timeManager/components/TaskCard.jsx
)

if exist "frontend_backup_2025-11-23\NavBar.js" (
    copy "frontend_backup_2025-11-23\NavBar.js" "frontend\src\components\NavBar.js" >nul
    echo ✓ Restored: components/NavBar.js
)

if exist "frontend_backup_2025-11-23\SmartFollowButton.jsx" (
    copy "frontend_backup_2025-11-23\SmartFollowButton.jsx" "frontend\src\components\SmartFollowButton.jsx" >nul
    echo ✓ Restored: components/SmartFollowButton.jsx
)

echo.
echo ============================================
echo   Rollback Complete!
echo ============================================
echo.
echo All files have been restored from backup.
echo You can now rebuild your application.
echo.
pause
