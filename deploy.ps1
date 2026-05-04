# ============================================================================
# YAZIT - Deployment Script for Windows PowerShell
# Packages the project, uploads to the Ubuntu home server, builds & starts
# the Docker containers, then verifies the app is running.
#
# Usage:
#   .\deploy.ps1              # Full deploy (upload + build + restart)
#   .\deploy.ps1 -Quick       # Code change only: upload + rebuild, skip DB wait
#   .\deploy.ps1 -SkipUpload  # Skip SCP (reuse files already on server)
#   .\deploy.ps1 -SkipBuild   # Skip docker build (only restart containers)
#
# Requirements:
#   • OpenSSH client (ssh + scp) installed on Windows
#   • SSH key-based auth set up for bilgin@192.168.50.100
#   • .env file must exist on the server at $ServerPath/.env
#     (first time: the script will warn and show what values are needed)
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP   = "192.168.50.100",

    [Parameter(Mandatory=$false)]
    [string]$ServerUser = "bilgin",

    # Where the project files live on the server (docker-compose.yml, Dockerfile, src/)
    [Parameter(Mandatory=$false)]
    [string]$ServerPath = "/opt/stack/yazit",

    # Where persistent data lives (postgres DB files, uploaded media)
    [Parameter(Mandatory=$false)]
    [string]$DataPath   = "/home/bilgin/yazit",

    [Parameter(Mandatory=$false)]
    [switch]$SkipUpload = $false,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild  = $false,

    # Quick mode: upload + rebuild only. Skips DB health poll (assumes DB is up).
    # Use this for routine code changes after the first full deploy.
    [Parameter(Mandatory=$false)]
    [switch]$Quick = $false
)

$ErrorActionPreference = "Stop"
$SERVER = "${ServerUser}@${ServerIP}"

# ── Banner ────────────────────────────────────────────────────────────────────
Write-Host ""
$modeLabel = if ($Quick) { "QUICK (upload + rebuild)" } elseif ($SkipBuild) { "RESTART ONLY" } elseif ($SkipUpload) { "BUILD + RESTART" } else { "FULL DEPLOY" }
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  YAZIT - Deployment Script  [$modeLabel]" -ForegroundColor Cyan
Write-Host "  Target: $SERVER"                           -ForegroundColor Cyan
Write-Host "  Path:   $ServerPath"                        -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── [1/7] Prerequisites ───────────────────────────────────────────────────────
Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow

foreach ($tool in @("ssh", "scp")) {
    try {
        $null = Get-Command $tool -ErrorAction Stop
        Write-Host "  [OK] $tool found" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] $tool not found. Install OpenSSH Client from Windows Settings > Apps > Optional features." -ForegroundColor Red
        exit 1
    }
}

# ── [2/7] SSH connectivity ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/7] Testing SSH connection to $SERVER..." -ForegroundColor Yellow
try {
    $result = ssh -o ConnectTimeout=5 $SERVER "echo OK" 2>&1
    if ($result -ne "OK") { throw "Unexpected response: $result" }
    Write-Host "  [OK] SSH connection successful" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] SSH connection failed: $_" -ForegroundColor Red
    Write-Host "  Tip: Check your server is reachable and the username/IP are correct." -ForegroundColor Yellow
    exit 1
}

# ── [3/7] Upload project files ────────────────────────────────────────────────
if (-Not $SkipUpload) {
    Write-Host ""
    Write-Host "[3/7] Packaging and uploading project files..." -ForegroundColor Yellow
    Write-Host "  (node_modules, .next, .env and media uploads are excluded)" -ForegroundColor Gray

    $SCRIPT_DIR  = $PSScriptRoot
    $ARCHIVE_PATH = Join-Path $env:TEMP "yazit-deploy.zip"

    # Collect files to include, explicitly skipping heavy/sensitive directories
    # IMPORTANT: patterns are matched with -like "*pattern*" against the relative
    # file path, so they must not accidentally match file/folder *names* (e.g.
    # "out" would match "TimelineCalloutBlock.ts" because "Callout" contains "out").
    # Use path-separator-anchored patterns for directory names.
    $excludePatterns = @(
        "node_modules",
        ".next",
        "\out\", "/out/",   # only the out/ build directory, not words containing "out"
        ".git",
        "public\media", "public/media",
        ".env", ".env.local",
        "*.log", ".DS_Store"
    )

    Write-Host "  Creating deployment archive..." -ForegroundColor Gray

    # Build file list, filter out excluded patterns
    $filesToZip = Get-ChildItem -Path $SCRIPT_DIR -Recurse -File | Where-Object {
        $relativePath = $_.FullName.Substring($SCRIPT_DIR.Length + 1)
        $excluded = $false
        foreach ($pattern in $excludePatterns) {
            if ($relativePath -like "*$pattern*") {
                $excluded = $true
                break
            }
        }
        -not $excluded
    }

    # Remove old archive if it exists
    if (Test-Path $ARCHIVE_PATH) { Remove-Item $ARCHIVE_PATH -Force }

    # Create zip from filtered file list
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::Open($ARCHIVE_PATH, 'Create')
    foreach ($file in $filesToZip) {
        $entryName = $file.FullName.Substring($SCRIPT_DIR.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName) | Out-Null
    }
    $zip.Dispose()

    $archiveSizeMB = [math]::Round((Get-Item $ARCHIVE_PATH).Length / 1MB, 1)
    Write-Host "  Archive size: ${archiveSizeMB} MB" -ForegroundColor Gray

    # Upload archive to server's /tmp
    Write-Host "  Uploading to ${SERVER}:/tmp/yazit-deploy.zip ..." -ForegroundColor Gray
    scp "$ARCHIVE_PATH" "${SERVER}:/tmp/yazit-deploy.zip"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Upload failed" -ForegroundColor Red
        exit 1
    }

    # On the server: create directories, extract archive, clean up
    Write-Host "  Extracting on server..." -ForegroundColor Gray
    # Upload the setup script (same pattern as ASL deploy — avoids heredoc quoting issues)
    Write-Host "  Uploading setup script..." -ForegroundColor Gray
    scp "$SCRIPT_DIR\setup-server.sh" "${SERVER}:/tmp/setup-server.sh"

    # Fix Windows CRLF line endings so bash can run it
    ssh $SERVER "sed -i 's/\r//' /tmp/setup-server.sh && chmod +x /tmp/setup-server.sh"

    # Run with -t so sudo can prompt for the password interactively
    Write-Host "  Running setup on server (sudo password may be required)..." -ForegroundColor Gray
    ssh -t $SERVER "bash /tmp/setup-server.sh '$ServerPath' '$ServerUser'"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Extraction failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "  [OK] Files deployed to $ServerPath" -ForegroundColor Green
    Remove-Item $ARCHIVE_PATH -Force -ErrorAction SilentlyContinue
} else {
    Write-Host ""
    Write-Host "[3/7] Skipping upload (--SkipUpload)" -ForegroundColor Yellow
}

# ── [4/7] Data directories & .env check ──────────────────────────────────────
Write-Host ""
Write-Host "[4/7] Ensuring data directories and .env on server..." -ForegroundColor Yellow

# Data directories are created by setup-server.sh in step 3.
# Just confirm they exist (no sudo needed — bilgin owns /home/bilgin).
ssh $SERVER "mkdir -p $DataPath/postgres $DataPath/media" | Out-Null
Write-Host "  [OK] Data directories: $DataPath/postgres  $DataPath/media" -ForegroundColor Green

# Check whether .env exists on the server
$envExists = ssh $SERVER "test -f $ServerPath/.env && echo yes || echo no"
if ($envExists.Trim() -ne "yes") {
    Write-Host ""
    Write-Host "  [WARN] No .env found at $ServerPath/.env on the server." -ForegroundColor Yellow
    Write-Host "  You must create it before the app can start." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  SSH into the server and run:" -ForegroundColor White
    Write-Host "    ssh $SERVER" -ForegroundColor Cyan
    Write-Host "    nano $ServerPath/.env" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Required variables (copy from .env.example):" -ForegroundColor White
    Write-Host "    DATABASE_URL=postgresql://yazit_user:STRONG_PW@db:5432/yazit_db" -ForegroundColor Gray
    Write-Host "    POSTGRES_USER=yazit_user" -ForegroundColor Gray
    Write-Host "    POSTGRES_PASSWORD=STRONG_PW" -ForegroundColor Gray
    Write-Host "    POSTGRES_DB=yazit_db" -ForegroundColor Gray
    Write-Host "    PAYLOAD_SECRET=<run on server: openssl rand -hex 32>" -ForegroundColor Gray
    Write-Host "    NEXT_PUBLIC_SERVER_URL=https://ybilgin.com" -ForegroundColor Gray
    Write-Host "    REVALIDATION_SECRET=...another random 32-byte hex string..." -ForegroundColor Gray
    Write-Host ""

    $continue = Read-Host "Continue deployment anyway? The app container will fail to start without .env. [y/N]"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Deployment cancelled. Re-run after creating .env on the server." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "  [OK] .env exists on server" -ForegroundColor Green
}

# ── [5/7] Start DB and wait for healthy ───────────────────────────────────────
Write-Host ""
Write-Host "[5/7] Starting database service..." -ForegroundColor Yellow
ssh $SERVER "cd $ServerPath && docker compose up -d db"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to start DB" -ForegroundColor Red
    exit 1
}

# Check if already healthy before polling (saves ~30-60 s on routine deploys)
$status = ssh $SERVER "docker inspect --format='{{.State.Health.Status}}' yazit_db 2>/dev/null || echo unknown"
if ($status.Trim() -eq "healthy") {
    Write-Host "  [OK] Database is already healthy — skipping wait" -ForegroundColor Green
} elseif ($Quick) {
    Write-Host "  [OK] Quick mode — skipping DB health poll (DB was already running)" -ForegroundColor Green
} else {
    # Poll for DB health (up to 60 seconds)
    Write-Host "  Waiting for Postgres to be healthy..." -ForegroundColor Gray
    $healthy = $false
    for ($i = 1; $i -le 12; $i++) {
        Start-Sleep -Seconds 5
        $status = ssh $SERVER "docker inspect --format='{{.State.Health.Status}}' yazit_db 2>/dev/null || echo unknown"
        Write-Host "  ($i/12) DB status: $($status.Trim())" -ForegroundColor Gray
        if ($status.Trim() -eq "healthy") {
            $healthy = $true
            break
        }
    }
    if (-Not $healthy) {
        Write-Host "  [ERROR] DB did not become healthy in 60 s. Check logs:" -ForegroundColor Red
        Write-Host "    ssh $SERVER `"sudo docker compose -f $ServerPath/docker-compose.yml logs db`"" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "  [OK] Database is healthy" -ForegroundColor Green
}

# ── [6/7] Build & start app ───────────────────────────────────────────────────
Write-Host ""
if (-Not $SkipBuild) {
    Write-Host "[6/7] Building app container (this takes 3-5 minutes first time)..." -ForegroundColor Yellow
    ssh -t $SERVER "cd $ServerPath && docker compose build app"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Build failed" -ForegroundColor Red
        Write-Host "  Check build logs above for details." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "  [OK] Build complete" -ForegroundColor Green
} else {
    Write-Host "[6/7] Skipping build (--SkipBuild)" -ForegroundColor Yellow
}

Write-Host "  Starting app container..." -ForegroundColor Gray
ssh $SERVER "cd $ServerPath && docker compose up -d --no-deps app"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] App container failed to start" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] App container started" -ForegroundColor Green

# ── [7/7] Health check ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[7/7] Waiting for app to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Hit the app from inside the server (port is bound to 127.0.0.1 only)
$httpStatus = ssh $SERVER "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/ --max-time 10 || echo 000"
$httpStatus = $httpStatus.Trim()

if ($httpStatus -eq "200") {
    Write-Host "  [OK] App is responding (HTTP $httpStatus)" -ForegroundColor Green
} elseif ($httpStatus -ne "000") {
    Write-Host "  [OK] App is responding (HTTP $httpStatus - redirects/auth are expected)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] App did not respond within 10 s (got: $httpStatus)" -ForegroundColor Yellow
    Write-Host "  It may still be booting. Check logs:" -ForegroundColor Yellow
    Write-Host "    ssh $SERVER `"sudo docker compose -f $ServerPath/docker-compose.yml logs -f app`"" -ForegroundColor Cyan
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!"                      -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
  Write-Host "  Public site:   https://yazit.ybilgin.com"             -ForegroundColor Green
  Write-Host "  Admin panel:   https://yazit.ybilgin.com/admin"       -ForegroundColor Green
  Write-Host "  Local (LAN):   http://${ServerIP}:3002"         -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
  Write-Host "  Logs (live):   ssh $SERVER `"docker compose -f $ServerPath/docker-compose.yml logs -f app`"" -ForegroundColor White
  Write-Host "  Restart app:   ssh $SERVER `"cd $ServerPath && docker compose restart app`""                   -ForegroundColor White
  Write-Host "  Stop all:      ssh $SERVER `"cd $ServerPath && docker compose down`""                          -ForegroundColor White
  Write-Host "  DB shell:      ssh $SERVER `"docker exec -it yazit_db psql -U yazit_user -d yazit_db`""       -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
  Write-Host "  1. In Cloudflare Zero Trust: add route yazit.ybilgin.com -> http://192.168.50.100:3002" -ForegroundColor White
  Write-Host "  2. Open https://yazit.ybilgin.com/admin and create your first admin user"             -ForegroundColor White
Write-Host ""
