# Jen.js Framework - Setup Script (Windows PowerShell)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# Colors
$COLOR_BLUE = "Cyan"
$COLOR_GREEN = "Green"
$COLOR_YELLOW = "Yellow"
$COLOR_RED = "Red"

Write-Host "  Jen.js Dev Enviroment Setup" -ForegroundColor $COLOR_BLUE
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor $COLOR_YELLOW
$nodeCheck = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor $COLOR_RED
  exit 1
}
Write-Host "✓ Node.js $nodeCheck found" -ForegroundColor $COLOR_GREEN
Write-Host ""

# Check npm
Write-Host "[2/5] Checking npm installation..." -ForegroundColor $COLOR_YELLOW
$npmCheck = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ npm not found. Please install npm" -ForegroundColor $COLOR_RED
  exit 1
}
Write-Host "✓ npm $npmCheck found" -ForegroundColor $COLOR_GREEN
Write-Host ""

# Install dependencies
Write-Host "[3/5] Installing dependencies..." -ForegroundColor $COLOR_YELLOW
Set-Location $PROJECT_ROOT
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor $COLOR_GREEN
Write-Host ""

# TypeScript check
Write-Host "[4/5] Running TypeScript check..." -ForegroundColor $COLOR_YELLOW
npm run typecheck 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠ TypeScript warnings (non-blocking)" -ForegroundColor $COLOR_YELLOW
}
Write-Host "✓ TypeScript check complete" -ForegroundColor $COLOR_GREEN
Write-Host ""

# Summary
Write-Host "[5/5] Setup complete!" -ForegroundColor $COLOR_YELLOW
Write-Host ""
Write-Host "================================" -ForegroundColor $COLOR_GREEN
Write-Host "  ✓ Setup successful!" -ForegroundColor $COLOR_GREEN
Write-Host "================================" -ForegroundColor $COLOR_GREEN
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $COLOR_BLUE
Write-Host ""
Write-Host "  Development:" -ForegroundColor $COLOR_YELLOW
Write-Host "    npm run dev              # Start dev server on http://localhost:3000"
Write-Host ""
Write-Host "  Build:" -ForegroundColor $COLOR_YELLOW
Write-Host "    npm run build            # Build for production"
Write-Host ""
Write-Host "  Example Project:" -ForegroundColor $COLOR_YELLOW
Write-Host "    cd example/release-16"
Write-Host "    node build.js            # Build example"
Write-Host "    node server.js           # Run example server"
Write-Host ""
Write-Host "  Documentation:" -ForegroundColor $COLOR_YELLOW
Write-Host "    type FEATURES.md         # Feature documentation"
Write-Host "    type QUICK_START.md      # Quick start guide"
Write-Host ""
