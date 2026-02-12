/**
 * Verification script to test JenPress setup
 * Run: npx tsx verify-setup.ts
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function verify() {
  console.log('\n📚 JenPress Setup Verification\n');
  
  const checks = [
    {
      name: 'package.json exists',
      check: () => existsSync(resolve(__dirname, 'package.json')),
    },
    {
      name: 'src/ directory exists',
      check: () => existsSync(resolve(__dirname, 'src')),
    },
    {
      name: 'bin/jenpress.js exists',
      check: () => existsSync(resolve(__dirname, 'bin/jenpress.js')),
    },
    {
      name: 'tsconfig.json exists',
      check: () => existsSync(resolve(__dirname, 'tsconfig.json')),
    },
    {
      name: 'example-docs/ exists',
      check: () => existsSync(resolve(__dirname, 'example-docs')),
    },
  ];
  
  // File structure checks
  console.log('Checking file structure:');
  let allPass = true;
  for (const { name, check } of checks) {
    const passed = check();
    console.log(`  ${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPass = false;
  }
  
  // Import checks
  console.log('\nChecking TypeScript imports:');
  try {
    const config = await import('./src/node/config.ts');
    console.log('  ✅ Config module imports');
    
    const testConfig = config.defineConfig({ title: 'Test' });
    console.log('  ✅ defineConfig() works');
    
    if (testConfig.title === 'Test' && testConfig.srcDir === 'docs') {
      console.log('  ✅ Config has proper defaults');
    }
  } catch (error) {
    console.log(`  ❌ Config import failed: ${error.message}`);
    allPass = false;
  }
  
  try {
    const vitePlugin = await import('./src/node/vite-plugin.ts');
    console.log('  ✅ Vite plugin module imports');
  } catch (error) {
    console.log(`  ❌ Vite plugin import failed: ${error.message}`);
    allPass = false;
  }
  
  try {
    const markdown = await import('./src/node/markdown/parser.ts');
    console.log('  ✅ Markdown parser module imports');
  } catch (error) {
    console.log(`  ❌ Markdown parser import failed: ${error.message}`);
    allPass = false;
  }
  
  // Summary
  console.log('\n' + (allPass ? '✅ All checks passed!' : '❌ Some checks failed'));
  console.log('\nNext steps:');
  console.log('  1. Install dependencies: pnpm install');
  console.log('  2. Start dev server: pnpm dev');
  console.log('  3. Build site: pnpm build');
  console.log('  4. Serve build: pnpm serve\n');
  
  process.exit(allPass ? 0 : 1);
}

verify().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
