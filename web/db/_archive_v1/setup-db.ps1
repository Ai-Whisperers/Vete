# Database Setup Script for Vete
# Usage: .\setup-db.ps1 [-Mode <full|schema|seeds|clean|file>] [-File <filename>]
#
# Modes:
#   full   - Run cleanup + all schema + all seeds (default)
#   schema - Run cleanup + schema files only (00-89)
#   seeds  - Run seed files only (90-99)
#   clean  - Run only 00_cleanup.sql
#   file   - Run a single SQL file
#   fixes  - Run only fix files (100+)

param(
    [ValidateSet("full", "schema", "seeds", "clean", "file", "fixes")]
    [string]$Mode = "full",
    [string]$File = "",
    [switch]$DryRun,
    [switch]$UseFullSetup
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Step { param($msg) Write-Host "▶ $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "✗ $msg" -ForegroundColor Red }

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Load DATABASE_URL from .env.local
$envFile = Join-Path (Split-Path -Parent $scriptDir) ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Err ".env.local not found at $envFile"
    exit 1
}

$dbUrl = Get-Content $envFile | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object { $_ -replace "^DATABASE_URL=", "" }
if (-not $dbUrl) {
    Write-Err "DATABASE_URL not found in .env.local"
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "       Vete Database Setup Script" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Step "Mode: $Mode"
if ($DryRun) { Write-Warn "DRY RUN - No SQL will be executed" }
Write-Host ""

# Function to run SQL file
function Invoke-SqlFile {
    param($filePath)

    $fileName = Split-Path -Leaf $filePath

    if (-not (Test-Path $filePath)) {
        Write-Warn "File not found: $fileName"
        return $false
    }

    if ($DryRun) {
        Write-Host "  [DRY] Would run: $fileName" -ForegroundColor Gray
        return $true
    }

    Write-Host "  Running: $fileName" -ForegroundColor Gray -NoNewline

    try {
        # Use psql to run the file
        $env:PGPASSWORD = ($dbUrl -split "@" | Select-Object -First 1) -replace ".*:", ""
        $result = & psql $dbUrl -f $filePath -v ON_ERROR_STOP=1 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓" -ForegroundColor Green
            return $true
        } else {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "    Error: $result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
        return $false
    }
}

# Get SQL files
$allFiles = Get-ChildItem -Path $scriptDir -Filter "*.sql" |
    Where-Object { $_.Name -match "^\d+.*\.sql$" } |
    Sort-Object { [int]($_.Name -replace "^(\d+).*", '$1') }

$schemaFiles = $allFiles | Where-Object { [int]($_.Name -replace "^(\d+).*", '$1') -lt 90 }
$seedFiles = $allFiles | Where-Object { [int]($_.Name -replace "^(\d+).*", '$1') -ge 90 -and [int]($_.Name -replace "^(\d+).*", '$1') -lt 100 }
$fixFiles = $allFiles | Where-Object { [int]($_.Name -replace "^(\d+).*", '$1') -ge 100 }

# Execute based on mode
$success = $true

switch ($Mode) {
    "full" {
        if ($UseFullSetup -and (Test-Path "_FULL_SETUP.sql")) {
            Write-Step "Running _FULL_SETUP.sql (combined file)"
            $success = Invoke-SqlFile (Join-Path $scriptDir "_FULL_SETUP.sql")
        } else {
            Write-Step "Running schema files ($($schemaFiles.Count) files)"
            foreach ($file in $schemaFiles) {
                if (-not (Invoke-SqlFile $file.FullName)) {
                    $success = $false
                    if (-not $DryRun) { break }
                }
            }

            if ($success) {
                Write-Host ""
                Write-Step "Running seed files ($($seedFiles.Count) files)"
                foreach ($file in $seedFiles) {
                    if (-not (Invoke-SqlFile $file.FullName)) {
                        $success = $false
                        if (-not $DryRun) { break }
                    }
                }
            }

            if ($success -and $fixFiles.Count -gt 0) {
                Write-Host ""
                Write-Step "Running fix files ($($fixFiles.Count) files)"
                foreach ($file in $fixFiles) {
                    if (-not (Invoke-SqlFile $file.FullName)) {
                        $success = $false
                        if (-not $DryRun) { break }
                    }
                }
            }
        }
    }

    "schema" {
        Write-Step "Running schema files only ($($schemaFiles.Count) files)"
        foreach ($file in $schemaFiles) {
            if (-not (Invoke-SqlFile $file.FullName)) {
                $success = $false
                if (-not $DryRun) { break }
            }
        }
    }

    "seeds" {
        Write-Step "Running seed files only ($($seedFiles.Count) files)"
        foreach ($file in $seedFiles) {
            if (-not (Invoke-SqlFile $file.FullName)) {
                $success = $false
                if (-not $DryRun) { break }
            }
        }
    }

    "clean" {
        Write-Step "Running cleanup only"
        $cleanupFile = Join-Path $scriptDir "00_cleanup.sql"
        $success = Invoke-SqlFile $cleanupFile
    }

    "fixes" {
        Write-Step "Running fix files only ($($fixFiles.Count) files)"
        foreach ($file in $fixFiles) {
            if (-not (Invoke-SqlFile $file.FullName)) {
                $success = $false
                if (-not $DryRun) { break }
            }
        }
    }

    "file" {
        if (-not $File) {
            Write-Err "Please specify a file with -File parameter"
            exit 1
        }
        $filePath = if ([System.IO.Path]::IsPathRooted($File)) { $File } else { Join-Path $scriptDir $File }
        Write-Step "Running single file: $File"
        $success = Invoke-SqlFile $filePath
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
if ($success) {
    Write-Success "Database setup completed successfully!"
} else {
    Write-Err "Database setup failed - check errors above"
    exit 1
}
Write-Host ""
