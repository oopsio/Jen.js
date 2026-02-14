/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
