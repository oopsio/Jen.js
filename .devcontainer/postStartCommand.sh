#!/bin/bash

# Jen.js Development Container - Post-Start Setup
# This script runs every time the container starts

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Container started, refreshing environment...${NC}"

# Update pnpm store in case it was corrupted
pnpm store status > /dev/null 2>&1 || true

# Verify dependencies are still installed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    pnpm install --frozen-lockfile
fi

echo -e "${GREEN}✅ Container ready!${NC}"
echo ""
echo "Run 'pnpm dev' to start the development server"
