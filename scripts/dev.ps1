# Jen.js Framework - Development Server (Windows PowerShell)

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# Colors
$COLOR_BLUE = "Cyan"
$COLOR_GREEN = "Green"
$COLOR_YELLOW = "Yellow"

Write-Host "Starting Jen.js development server..." -ForegroundColor $COLOR_BLUE
Write-Host ""

Set-Location $PROJECT_ROOT

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
  Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor $COLOR_YELLOW
  npm install
  Write-Host ""
}

Write-Host "✓ Dependencies ready" -ForegroundColor $COLOR_GREEN
Write-Host ""
Write-Host "Development server options:" -ForegroundColor $COLOR_BLUE
Write-Host ""
Write-Host "  1. Main framework dev" -ForegroundColor $COLOR_YELLOW
Write-Host "    npm run dev"
Write-Host ""
Write-Host "  2. Run example project" -ForegroundColor $COLOR_YELLOW
Write-Host "    cd example/release-16"
Write-Host "    node server.js"
Write-Host ""
Write-Host "  3. Build example project" -ForegroundColor $COLOR_YELLOW
Write-Host "    cd example/release-16"
Write-Host "    node build.js"
Write-Host ""

# Start dev server
npm run dev
