#!/bin/bash

################################################################################
# Jen.js Framework - Setup Script (Linux/macOS)
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Jen.js Framework Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Check npm
echo -e "${YELLOW}[2/5] Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found. Please install npm${NC}"
  exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}[3/5] Installing dependencies...${NC}"
cd "$PROJECT_ROOT"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# TypeScript check
echo -e "${YELLOW}[4/5] Running TypeScript check...${NC}"
npm run typecheck || echo -e "${YELLOW}⚠ TypeScript warnings (non-blocking)${NC}"
echo -e "${GREEN}✓ TypeScript check complete${NC}"
echo ""

# Summary
echo -e "${YELLOW}[5/5] Setup complete!${NC}"
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  ✓ Setup successful!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  ${YELLOW}Development:${NC}"
echo -e "    npm run dev              # Start dev server on http://localhost:3000"
echo ""
echo -e "  ${YELLOW}Build:${NC}"
echo -e "    npm run build            # Build for production"
echo ""
echo -e "  ${YELLOW}Example Project:${NC}"
echo -e "    cd example/release-16"
echo -e "    node build.js            # Build example"
echo -e "    node server.js           # Run example server"
echo ""
echo -e "  ${YELLOW}Documentation:${NC}"
echo -e "    cat FEATURES.md          # Feature documentation"
echo -e "    cat QUICK_START.md       # Quick start guide"
echo ""
