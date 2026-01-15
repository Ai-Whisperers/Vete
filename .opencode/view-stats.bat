@echo off
REM View OhMyOpenCode Statistics and Costs
REM Shows usage, costs, and budget status

echo.
echo ========================================
echo  OhMyOpenCode Statistics Dashboard
echo ========================================
echo.

cd /d C:\Users\Alejandro\Documents\Ivan\Adris\Vete

REM Check if we have any session data
echo [INSTALLATION INFO]
echo Installation Date: January 14, 2026
echo OpenCode Version: 1.1.20
echo OhMyOpenCode: Installed
echo.

REM Budget Status
echo [BUDGET STATUS]
echo.
echo Resources:
echo   Gemini Pro:      UNLIMITED (FREE)
echo   Claude Calls:    20 total (prepaid)
echo   OpenCode Credit: $20 (backup)
echo.

REM Current Usage
echo [CURRENT USAGE]
if exist .opencode\claude-usage.txt (
    type .opencode\claude-usage.txt
) else (
    echo No usage yet - Budget tracker not found
    echo Creating tracker...
    echo # Claude Usage Tracker > .opencode\claude-usage.txt
    echo. >> .opencode\claude-usage.txt
    echo Budget: 20 calls total >> .opencode\claude-usage.txt
    echo Remaining: 20/20 >> .opencode\claude-usage.txt
    echo. >> .opencode\claude-usage.txt
    echo Created: .opencode\claude-usage.txt
)
echo.

REM Cost Summary
echo [COST SUMMARY]
echo.
echo Since Installation (Jan 14, 2026):
echo   Gemini Tasks:    0 tasks  ($0 - FREE)
echo   Claude Calls:    0 calls  ($0 - 20 remaining)
echo   OpenCode Credit: $20 unused
echo   ----------------------------------------
echo   TOTAL COST:      $0.00
echo.
echo Target Monthly Cost: $0-15
echo Old Monthly Cost:    $255
echo Target Savings:      $240-255 (94-100%%)
echo.

REM Configuration Check
echo [CONFIGURATION]
echo.
echo Main Agent:      Gemini 3 Flash (FREE)
echo Explore Agent:   Gemini 3 Flash (FREE)
echo Librarian:       GLM-4.7-FREE (FREE)
echo Oracle:          Claude Sonnet (20 calls max)
echo Frontend:        Gemini 3 Pro High (FREE)
echo.
echo Budget Protection:
echo   - Claude concurrency: 1 (PROTECTED)
echo   - Gemini concurrency: 50 (UNLIMITED)
echo.

REM Check for OpenCode logs
echo [SESSION LOGS]
if exist "%USERPROFILE%\.config\opencode\logs\" (
    echo OpenCode logs location: %USERPROFILE%\.config\opencode\logs\
    echo.
    echo Recent logs:
    dir /b /o-d "%USERPROFILE%\.config\opencode\logs\" 2>nul | head -5
) else (
    echo No session logs yet (no sessions run)
)
echo.

REM Check session history
echo [SESSION HISTORY]
if exist "%USERPROFILE%\.config\opencode\sessions\" (
    echo Sessions directory: %USERPROFILE%\.config\opencode\sessions\
    for /f %%a in ('dir /b "%USERPROFILE%\.config\opencode\sessions\" 2^>nul ^| find /c /v ""') do set session_count=%%a
    if defined session_count (
        echo Total sessions: %session_count%
    ) else (
        echo Total sessions: 0
    )
) else (
    echo No sessions yet
)
echo.

echo [TRACKING INSTRUCTIONS]
echo.
echo To track costs manually:
echo   1. After each session: Count how many times you used 'oracle'
echo   2. Edit: .opencode\claude-usage.txt
echo   3. Log each Claude call with: date, reason, outcome
echo   4. Update remaining count
echo.
echo To view detailed logs:
echo   - OpenCode logs: %USERPROFILE%\.config\opencode\logs\
echo   - Session history: %USERPROFILE%\.config\opencode\sessions\
echo   - Budget tracker: .opencode\claude-usage.txt
echo.

echo ========================================
echo  End of Statistics
echo ========================================
echo.
pause
