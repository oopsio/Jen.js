#!/usr/bin/env node
/**
 * Interactive help for npm scripts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

const helpText = `
╔════════════════════════════════════════════════════════════════════════════╗
║                  JEN.JS FRAMEWORK - QUICK START GUIDE                     ║
╚════════════════════════════════════════════════════════════════════════════╝

🚀 GETTING STARTED
  npm run setup              - Install dependencies and setup environment
  npm run dev               - Start development server with hot reload
  npm run build             - Build static site for production
  npm run start             - Start production server

📊 TESTING & VALIDATION
  npm run test              - Run all tests in watch mode
  npm run test:run          - Run tests once (CI-friendly)
  npm run test:coverage     - Generate coverage report
  npm run typecheck         - Check TypeScript types
  npm run lint              - Lint code
  npm run lint:fix          - Auto-fix linting issues
  npm run validate          - Run full validation (types, lint, test)

🔨 BUILD & COMPILATION
  npm run build:ssg         - Build static site generator output
  npm run build:esm         - Build ES modules
  npm run build:types       - Generate TypeScript definitions
  npm run bundle            - Bundle framework artifacts
  npm run perf:analyze      - Analyze bundle size

🗄️  DATABASE
  npm run db:migrate        - Run database migrations
  npm run db:seed           - Seed database with sample data
  npm run db:reset          - Reset database (migrate + seed)
  npm run db:backup         - Backup database

🚢 DEPLOYMENT
  npm run deploy            - Deploy to production
  npm run deploy:staging    - Deploy to staging
  npm run deploy:health     - Check deployment health

🐳 DOCKER
  npm run docker:build      - Build Docker image
  npm run docker:compose:up - Start Docker Compose stack
  npm run docker:compose:down - Stop Docker Compose stack

📦 MONOREPO MANAGEMENT
  npm run packages:build    - Build all packages
  npm run packages:test     - Test all packages
  npm run packages:publish  - Publish packages to npm

⚙️  UTILITIES
  npm run clean             - Clean build artifacts
  npm run clean:all         - Full clean (dist + node_modules + cache)
  npm run format            - Format code with Prettier
  npm run script:list       - List all available scripts
  npm run script:help       - Show this help message

📚 DOCUMENTATION
  npm run docs              - Start documentation server
  npm run docs:build        - Build documentation static site
  npm run docs:generate     - Generate API documentation

Environment-specific builds:
  cross-env NODE_ENV=development npm run dev
  cross-env NODE_ENV=production npm run build
  cross-env NODE_ENV=test npm run test:run

Environment files:
  .env.development          - Development defaults
  .env.production           - Production configuration
  .env.test                 - Test environment
  .env.staging              - Staging environment
  .env.docker               - Docker environment
  .env.ci                   - CI/CD environment
  .env.build                - Build configuration
  .env.performance          - Performance testing

🔗 USEFUL LINKS
  GitHub:    https://github.com/kessud2021/Jen.js
  Docs:      https://jen.js.org/docs
  Issues:    https://github.com/kessud2021/Jen.js/issues

💡 TIPS
  • Use \`npm run dev:watch\` for incremental development
  • Use \`npm run validate\` before committing
  • Use \`npm run ci\` to run full CI pipeline locally
  • Check .env files for configuration examples
  • Run \`npm run setup\` after pulling changes

📋 For more details, see README.md
`;

console.log(helpText);
