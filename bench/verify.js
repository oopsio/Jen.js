#!/usr/bin/env node
/**
 * Benchmark Suite Verification Script
 * Validates benchmark structure and readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const benchFiles = [
  'build.bench.ts',
  'routing.bench.ts',
  'ssr.bench.ts',
  'middleware.bench.ts',
  'config.bench.ts',
];

const supportFiles = [
  'compare.js',
  'regression.js',
  'baseline.json',
  'package.json',
  'README.md',
  '.gitignore',
];

const allFiles = [...benchFiles, ...supportFiles];

function verify() {
  console.log('\n🔍 Verifying Jen.js Benchmark Suite\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  // Check benchmark files
  console.log('\n📊 Benchmark Files:');
  benchFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      console.log(`  ✅ ${file} (${stat.size} bytes)`);
      passed++;
    } else {
      console.log(`  ❌ ${file} - NOT FOUND`);
      failed++;
    }
  });

  // Check support files
  console.log('\n🔧 Support Files:');
  supportFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      console.log(`  ✅ ${file} (${stat.size} bytes)`);
      passed++;
    } else {
      console.log(`  ❌ ${file} - NOT FOUND`);
      failed++;
    }
  });

  // Verify baseline structure
  console.log('\n📈 Baseline Validation:');
  const baselinePath = path.join(__dirname, 'baseline.json');
  if (fs.existsSync(baselinePath)) {
    try {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
      const benchmarkCount = Object.values(baseline.benchmarks || {}).reduce(
        (sum, cat) => sum + Object.keys(cat).length,
        0
      );
      console.log(`  ✅ baseline.json is valid JSON`);
      console.log(`     Benchmarks defined: ${benchmarkCount}`);
      passed++;
    } catch (error) {
      console.log(`  ❌ baseline.json is invalid: ${error.message}`);
      failed++;
    }
  }

  // Count benchmarks
  console.log('\n📝 Benchmark Count:');
  let benchmarkCount = 0;
  benchFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/bench\(/g) || [];
      benchmarkCount += matches.length;
      console.log(`  ${file}: ${matches.length} benchmarks`);
    }
  });
  console.log(`  Total: ${benchmarkCount} benchmarks`);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Verification Results:`);
  console.log(`  Files present: ${passed}/${allFiles.length}`);
  console.log(`  Files missing: ${failed}/${allFiles.length}`);
  console.log(`  Total benchmarks: ${benchmarkCount}`);

  if (failed === 0) {
    console.log('\n✨ All checks passed! Benchmark suite is ready to use.');
    console.log('\nNext steps:');
    console.log('  1. npm run bench              - Run all benchmarks');
    console.log('  2. npm run bench:compare      - Compare against baseline');
    console.log('  3. npm run bench:regression   - Check for regressions');
    process.exit(0);
  } else {
    console.log('\n❌ Some files are missing. Please check the installation.');
    process.exit(1);
  }
}

verify();
