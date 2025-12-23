@echo off
echo Killing all Node.js processes...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0kill-node.ps1" -Force

echo.
pause

