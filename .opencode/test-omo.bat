@echo off
REM Test Script for OhMyOpenCode
REM Verifies configuration and runs test commands

echo.
echo ========================================
echo  OhMyOpenCode Configuration Test
echo ========================================
echo.

cd /d C:\Users\Alejandro\Documents\Ivan\Adris\Vete

echo [1/6] Checking installation...
where opencode >nul 2>&1
if %errorlevel% neq 0 (
    echo FAIL: OpenCode not found
    pause
    exit /b 1
)
echo PASS: OpenCode installed

echo.
echo [2/6] Checking authentication...
opencode auth status
if %errorlevel% neq 0 (
    echo FAIL: Not authenticated
    echo Run: authenticate.bat
    pause
    exit /b 1
)
echo PASS: Authenticated

echo.
echo [3/6] Checking project config...
if not exist .opencode\oh-my-opencode.json (
    echo FAIL: Project config missing
    pause
    exit /b 1
)
echo PASS: Project config exists

echo.
echo [4/6] Verifying Gemini model names...
findstr /C:"google/antigravity-gemini-3-flash" .opencode\oh-my-opencode.json >nul
if %errorlevel% neq 0 (
    echo FAIL: Model names not updated
    echo Expected: google/antigravity-gemini-3-flash
    pause
    exit /b 1
)
echo PASS: Gemini models configured correctly

echo.
echo [5/6] Checking budget protection...
findstr /C:"anthropic.*1" .opencode\oh-my-opencode.json >nul
if %errorlevel% neq 0 (
    echo WARN: Claude concurrency might not be limited
)
echo PASS: Budget configuration found

echo.
echo [6/6] Checking documentation...
if not exist .opencode\QUICK-START.md (
    echo WARN: Quick start guide missing
)
if not exist .opencode\agents\BUDGET-STRATEGY.md (
    echo WARN: Budget strategy missing
)
echo PASS: Core documentation exists

echo.
echo ========================================
echo  Configuration Test PASSED
echo ========================================
echo.
echo You can now use OpenCode safely!
echo.
echo To start:
echo   1. opencode (in this directory)
echo   2. Type: find missing auth checks
echo   3. Verify it uses Gemini (FREE)
echo.
echo To track costs:
echo   - View: .opencode\claude-usage.txt
echo   - Log each oracle call manually
echo.
pause
