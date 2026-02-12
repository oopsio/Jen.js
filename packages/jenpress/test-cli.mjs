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
