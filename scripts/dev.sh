#!/bin/bash

################################################################################
# Jen.js Framework - Development Server (Linux/macOS)
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Starting Jen.js development server...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
  npm install
  echo ""
fi

echo -e "${GREEN}✓ Dependencies ready${NC}"
echo ""
echo -e "${BLUE}Development server options:${NC}"
echo ""
echo -e "  ${YELLOW}1. Main framework dev${NC}"
echo -e "    npm run dev"
echo ""
echo -e "  ${YELLOW}2. Run example project${NC}"
echo -e "    cd example/release-16"
echo -e "    node server.js"
echo ""
echo -e "  ${YELLOW}3. Build example project${NC}"
echo -e "    cd example/release-16"
echo -e "    node build.js"
echo ""

# Start dev server
npm run dev
