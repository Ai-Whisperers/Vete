@echo off
echo ===================================================
echo   Adris Veterinaria - Automated Setup & Run
echo ===================================================
echo.

echo [1/4] Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is NOT installed on this computer!
    echo.
    echo You must install Node.js to run this application.
    echo Please go to: https://nodejs.org/
    echo Download and install the "LTS" version.
    echo.
    echo After installing, please run this file again.
    echo.
    pause
    exit /b
)
echo Node.js is installed. OK.

echo.
echo [2/4] Navigating to web directory...
cd web
if %errorlevel% neq 0 (
    echo Error: Could not find 'web' directory.
    pause
    exit /b
)

echo.
echo [3/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed. Please check your internet connection.
    pause
    exit /b
)

echo.
echo [4/4] Starting development server and opening browser...
echo.
echo The browser will open shortly at http://localhost:3000/adris
echo Press Ctrl+C to stop the server (close this window).
echo.

start http://localhost:3000/adris
npm run dev
