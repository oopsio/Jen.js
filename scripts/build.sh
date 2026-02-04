#!/bin/bash

################################################################################
# Jen.js Framework - Build Script (Linux/macOS)
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Jen.js Framework Build${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo ""
fi

# TypeScript check
echo -e "${YELLOW}[1/3] Running TypeScript check...${NC}"
npm run typecheck
echo -e "${GREEN}✓ TypeScript check passed${NC}"
echo ""

# Build project
echo -e "${YELLOW}[2/3] Building framework...${NC}"
npm run build
echo -e "${GREEN}✓ Framework built${NC}"
echo ""

# Build example
echo -e "${YELLOW}[3/3] Building example project...${NC}"
cd example/release-16
node build.js
echo -e "${GREEN}✓ Example project built${NC}"
echo ""

cd "$PROJECT_ROOT"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  ✓ Build successful!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Output locations:${NC}"
echo ""
echo -e "  Framework dist:     ${YELLOW}dist/${NC}"
echo -e "  Example dist:       ${YELLOW}example/release-16/dist/${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  ${YELLOW}Run example:${NC}"
echo -e "    cd example/release-16"
echo -e "    node server.js"
echo ""
echo -e "  ${YELLOW}Deploy:${NC}"
echo -e "    Copy dist/ and example/release-16/dist/ to production"
echo ""
