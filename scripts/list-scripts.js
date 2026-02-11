#!/usr/bin/env node
/**
 * List all available npm scripts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const scripts = packageJson.scripts || {};

// Group scripts by category
const grouped = {};
let currentCategory = 'Other';

Object.entries(scripts).forEach(([name, value]) => {
  if (value === '') {
    // Section header
    currentCategory = name.replace(/[=]/g, '').trim();
    grouped[currentCategory] = [];
  } else {
    if (!grouped[currentCategory]) {
      grouped[currentCategory] = [];
    }
    grouped[currentCategory].push({ name, value });
  }
});

console.log('\n📦 JEN.JS Framework - Available Scripts\n');
console.log('=' .repeat(80) + '\n');

Object.entries(grouped).forEach(([category, items]) => {
  if (items.length > 0) {
    console.log(`\n${category.toUpperCase()}`);
    console.log('-'.repeat(80));
    items.forEach(({ name, value }) => {
      console.log(`  npm run ${name.padEnd(30)} ${value.substring(0, 50)}...`);
    });
  }
});

console.log('\n' + '='.repeat(80) + '\n');
console.log(`Total scripts: ${Object.values(grouped).reduce((sum, items) => sum + items.length, 0)}\n`);
