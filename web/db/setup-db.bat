@echo off
setlocal

echo.
echo ===================================================
echo        Vete Database Setup
echo ===================================================
echo.
echo Choose an option:
echo   1. Full setup (schema + seeds + fixes)
echo   2. Schema only (no data)
echo   3. Seeds only (add demo data)
echo   4. Clean only (drop all tables)
echo   5. Fixes only (run 100+ files)
echo   6. Run single file
echo   7. Dry run (show what would run)
echo.

set /p choice="Enter choice (1-7): "

cd /d "%~dp0"

if "%choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode full
) else if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode schema
) else if "%choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode seeds
) else if "%choice%"=="4" (
    echo.
    echo WARNING: This will DROP ALL TABLES!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode clean
    ) else (
        echo Cancelled.
    )
) else if "%choice%"=="5" (
    powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode fixes
) else if "%choice%"=="6" (
    set /p filename="Enter filename: "
    powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode file -File "%filename%"
) else if "%choice%"=="7" (
    powershell -ExecutionPolicy Bypass -File setup-db.ps1 -Mode full -DryRun
) else (
    echo Invalid choice.
)

echo.
pause
