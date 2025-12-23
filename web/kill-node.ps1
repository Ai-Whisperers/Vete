# Kill All Node.js Processes
# Usage: .\kill-node.ps1 [-Force] [-Verbose]

param(
    [switch]$Force,
    [switch]$Verbose
)

Write-Host "`n🔍 Searching for Node.js processes..." -ForegroundColor Cyan

# Find all Node.js processes
$nodeProcesses = @(Get-Process -Name "node" -ErrorAction SilentlyContinue)

if ($nodeProcesses.Count -eq 0) {
    Write-Host "✅ No Node.js processes found running." -ForegroundColor Green
    exit 0
}

$processCount = $nodeProcesses.Count
Write-Host "`n⚠ Found $processCount Node.js process(es):" -ForegroundColor Yellow

# Display processes that will be killed
foreach ($proc in $nodeProcesses) {
    $memoryMB = [math]::Round($proc.WorkingSet64 / 1MB, 1)
    $cpuTime = $proc.CPU
    
    Write-Host "  • PID: $($proc.Id) | Memory: $memoryMB MB | CPU: $cpuTime" -ForegroundColor Gray
    
    if ($Verbose) {
        try {
            $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
            if ($commandLine) {
                Write-Host "    Command: $commandLine" -ForegroundColor DarkGray
            }
        } catch {
            # Ignore errors getting command line
        }
    }
}

# Confirm before killing (unless -Force is used)
if (-not $Force) {
    Write-Host "`n⚠ WARNING: This will kill all $processCount Node.js process(es)." -ForegroundColor Yellow
    $confirmation = Read-Host "Continue? (y/N)"
    
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Host "`n❌ Cancelled. No processes were killed." -ForegroundColor Red
        exit 0
    }
}

# Kill all Node.js processes
Write-Host "`n🔧 Killing Node.js processes..." -ForegroundColor Yellow

$killedCount = 0
$errors = @()

foreach ($proc in $nodeProcesses) {
    try {
        Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        Write-Host "  ✓ Killed PID: $($proc.Id)" -ForegroundColor Green
        $killedCount++
    } catch {
        $errorMsg = "Failed to kill PID: $($proc.Id) - $($_.Exception.Message)"
        Write-Host "  ❌ $errorMsg" -ForegroundColor Red
        $errors += $errorMsg
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Processes found: $processCount" -ForegroundColor Gray

$killedColor = if ($killedCount -eq $processCount) { "Green" } else { "Yellow" }
Write-Host "  • Processes killed: $killedCount" -ForegroundColor $killedColor

if ($errors.Count -gt 0) {
    Write-Host "  • Errors: $($errors.Count)" -ForegroundColor Red
    Write-Host "`n⚠ Some processes could not be killed. You may need to run as Administrator." -ForegroundColor Yellow
    exit 1
}

# Verify all processes are gone
Start-Sleep -Milliseconds 500
$remaining = @(Get-Process -Name "node" -ErrorAction SilentlyContinue)

if ($remaining.Count -gt 0) {
    Write-Host "`n⚠ WARNING: $($remaining.Count) Node.js process(es) are still running." -ForegroundColor Yellow
    Write-Host "  You may need to run this script as Administrator." -ForegroundColor Gray
    exit 1
} else {
    Write-Host "`n✅ All Node.js processes have been terminated successfully." -ForegroundColor Green
    exit 0
}

