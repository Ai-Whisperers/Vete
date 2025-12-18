# Reset Next.js Development Server
# Usage: .\reset-dev.ps1 [-Restart]

param(
    [switch]$Restart
)

Write-Host "Stopping Next.js dev server..." -ForegroundColor Yellow

# Kill processes on port 3000
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing $($process.ProcessName) (PID: $($process.Id)) on port 3000" -ForegroundColor Cyan
            Stop-Process -Id $process.Id -Force
        }
    }
} else {
    Write-Host "No process found on port 3000" -ForegroundColor Gray
}

# Delete .next folder
Write-Host "Deleting .next cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host ".next folder deleted" -ForegroundColor Green
} else {
    Write-Host ".next folder not found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green

# Restart if requested
if ($Restart) {
    Write-Host "Starting dev server..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "Run 'npm run dev' to restart the server." -ForegroundColor Cyan
}
