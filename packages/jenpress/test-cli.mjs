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
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing JenPress CLI...');
console.log('Current dir:', process.cwd());
console.log('Script dir:', __dirname);

try {
  // Test imports
  const configModule = await import('./src/node/config.ts');
  console.log('✅ Config module loaded');
  
  const defConfig = configModule.defineConfig({ title: 'Test' });
  console.log('✅ defineConfig works:', defConfig.title);
  
  console.log('\n🎉 JenPress is working!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
