#!/usr/bin/env node

import('../dist/cli/index.js').catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
