@echo off
REM Authentication Script for OhMyOpenCode
REM Run this in a NEW terminal window (to get updated PATH with Bun)

echo.
echo ========================================
echo  OhMyOpenCode Authentication Setup
echo ========================================
echo.

REM Step 1: Verify OpenCode is installed
echo [1/4] Checking OpenCode installation...
where opencode >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: OpenCode not found in PATH
    echo Please install OpenCode first
    pause
    exit /b 1
)
echo OK: OpenCode found

echo.
echo [2/4] Authenticating with Claude (for 20 oracle calls)...
echo.
echo When the browser opens:
echo   1. Sign in to your Anthropic account
echo   2. Authorize OpenCode
echo   3. Close the browser tab when done
echo.
pause
opencode auth login

echo.
echo [3/4] Authenticating with Google (for FREE Gemini)...
echo.
echo When the browser opens:
echo   1. Sign in to your Google account
echo   2. Authorize OpenCode/Antigravity
echo   3. Close the browser tab when done
echo.
pause
opencode auth login

echo.
echo [4/4] Verifying authentication...
opencode auth status

echo.
echo ========================================
echo  Authentication Complete!
echo ========================================
echo.
echo Next steps:
echo   1. cd C:\Users\Alejandro\Documents\Ivan\Adris\Vete
echo   2. opencode
echo   3. Type: find all API routes with missing auth
echo.
echo Expected: Uses FREE Gemini, cost = $0
echo.
pause
