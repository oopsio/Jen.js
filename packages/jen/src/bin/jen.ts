#!/usr/bin/env node

import { CliParser } from '../cli/index.js';

const args = process.argv.slice(2);

CliParser.executeCommand(args).catch((err) => {
  console.error('Jen.js encountered a fatal error:', err);
  process.exit(1);
});
