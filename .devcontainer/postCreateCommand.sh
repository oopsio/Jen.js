#!/bin/bash

# Jen.js Development Container - Post-Create Setup
# This script runs after the dev container is created

set -e

echo "🚀 Starting Jen.js Development Container Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check versions
echo -e "${BLUE}📋 Verifying environment...${NC}"
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"
echo "Git version: $(git --version)"
echo "Python version: $(python3 --version)"
echo ""

# Install dependencies with pnpm
echo -e "${BLUE}📦 Installing project dependencies...${NC}"
pnpm install --frozen-lockfile

echo ""
echo -e "${BLUE}🔨 Installing turbo globally...${NC}"
pnpm add -g turbo

echo ""
echo -e "${BLUE}⚡ Running TypeScript type checking...${NC}"
pnpm typecheck || echo "⚠️  Some type checks failed, but continuing..."

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Available Commands:${NC}"
echo "  pnpm dev          - Start development server"
echo "  pnpm build        - Build static site"
echo "  pnpm bundle       - Bundle framework artifacts"
echo "  pnpm typecheck    - Run TypeScript type checking"
echo "  pnpm test         - Run tests with Vitest"
echo "  pnpm test:ui      - Run tests with UI"
echo "  pnpm clean        - Clean build artifacts"
echo ""
echo -e "${YELLOW}Development Server:${NC}"
echo "  The dev server will run on http://localhost:5173"
echo ""
echo -e "${YELLOW}Monorepo Workspace:${NC}"
echo "  This is a pnpm workspace with multiple packages:"
echo "  - packages/*      - Core packages"
echo "  - example/*       - Example applications"
echo "  - site/**         - Website/site packages"
echo "  - jenpack/**      - Build tools"
echo "  - bench/**        - Benchmarks"
echo "  - preactsc/**     - Preact compiler"
echo ""
echo -e "${YELLOW}Quick Start:${NC}"
echo "  1. Run: pnpm dev"
echo "  2. Open http://localhost:5173 in your browser"
echo "  3. Edit files in site/ or src/ to see changes"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "  - Use turbo for building: turbo run build"
echo "  - Run specific package: pnpm --filter=<package-name> <command>"
echo "  - Clean all builds: pnpm clean"
echo ""
