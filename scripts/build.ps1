# Jen.js Framework - Build Script (Windows PowerShell)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# Colors
$COLOR_BLUE = "Cyan"
$COLOR_GREEN = "Green"
$COLOR_YELLOW = "Yellow"
$COLOR_RED = "Red"

Write-Host "================================" -ForegroundColor $COLOR_BLUE
Write-Host "  Jen.js Framework Build" -ForegroundColor $COLOR_BLUE
Write-Host "================================" -ForegroundColor $COLOR_BLUE
Write-Host ""

Set-Location $PROJECT_ROOT

# Check dependencies
if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor $COLOR_YELLOW
  npm install
  Write-Host ""
}

# TypeScript check
Write-Host "[1/3] Running TypeScript check..." -ForegroundColor $COLOR_YELLOW
npm run typecheck
Write-Host "✓ TypeScript check passed" -ForegroundColor $COLOR_GREEN
Write-Host ""

# Build project
Write-Host "[2/3] Building framework..." -ForegroundColor $COLOR_YELLOW
npm run build
Write-Host "✓ Framework built" -ForegroundColor $COLOR_GREEN
Write-Host ""

# Build example
Write-Host "[3/3] Building example project..." -ForegroundColor $COLOR_YELLOW
Set-Location "example\release-16"
node build.js
Write-Host "✓ Example project built" -ForegroundColor $COLOR_GREEN
Write-Host ""

Set-Location $PROJECT_ROOT

Write-Host "================================" -ForegroundColor $COLOR_GREEN
Write-Host "  ✓ Build successful!" -ForegroundColor $COLOR_GREEN
Write-Host "================================" -ForegroundColor $COLOR_GREEN
Write-Host ""
Write-Host "Output locations:" -ForegroundColor $COLOR_BLUE
Write-Host ""
Write-Host "  Framework dist:     dist\" -ForegroundColor $COLOR_YELLOW
Write-Host "  Example dist:       example\release-16\dist\" -ForegroundColor $COLOR_YELLOW
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $COLOR_BLUE
Write-Host ""
Write-Host "  Run example:" -ForegroundColor $COLOR_YELLOW
Write-Host "    cd example\release-16"
Write-Host "    node server.js"
Write-Host ""
Write-Host "  Deploy:" -ForegroundColor $COLOR_YELLOW
Write-Host "    Copy dist\ and example\release-16\dist\ to production"
Write-Host ""
