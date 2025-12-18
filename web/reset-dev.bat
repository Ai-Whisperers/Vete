@echo off
echo Stopping Next.js dev server...

:: Kill any process using port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a 2>nul
)

:: Also kill any node processes (fallback)
taskkill /F /IM node.exe 2>nul

echo Deleting .next cache...
if exist ".next" (
    rmdir /s /q .next
    echo .next folder deleted
) else (
    echo .next folder not found
)

echo.
echo Done! Run 'npm run dev' to restart the server.
pause
