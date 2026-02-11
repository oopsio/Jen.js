#!/usr/bin/env node
/**
 * Performance Regression Detection Script
 * Detects significant performance regressions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baselineFile = path.join(__dirname, 'baseline.json');
const resultsFile = path.join(__dirname, 'results.json');

function detectRegressions() {
  if (!fs.existsSync(resultsFile)) {
    console.error('❌ No results.json found. Run benchmarks first.');
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf-8'));
  const current = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
  const threshold = baseline.thresholds?.regression || 0.05;

  console.log(`\n🔍 Performance Regression Detection\n`);
  console.log(`Threshold: ${(threshold * 100).toFixed(1)}%\n`);

  const regressions = [];
  const improvements = [];

  const checkCategory = (category, baseBench, currBench) => {
    for (const [name, baselineData] of Object.entries(baseBench)) {
      const currentData = currBench[name];

      if (!currentData) continue;

      const baseAvg = baselineData.avg;
      const currAvg = currentData.avg;
      const diff = currAvg - baseAvg;
      const percentChange = diff / baseAvg;

      if (percentChange > threshold) {
        regressions.push({
          category,
          name,
          baselineAvg: baseAvg.toFixed(2),
          currentAvg: currAvg.toFixed(2),
          percentChange: (percentChange * 100).toFixed(2),
        });
      } else if (percentChange < -threshold * 2) {
        improvements.push({
          category,
          name,
          baselineAvg: baseAvg.toFixed(2),
          currentAvg: currAvg.toFixed(2),
          percentChange: (percentChange * 100).toFixed(2),
        });
      }
    }
  };

  if (baseline.benchmarks && current.benchmarks) {
    for (const category of Object.keys(baseline.benchmarks)) {
      if (current.benchmarks[category]) {
        checkCategory(category, baseline.benchmarks[category], current.benchmarks[category]);
      }
    }
  }

  if (regressions.length > 0) {
    console.log(`🚨 REGRESSIONS DETECTED (${regressions.length}):\n`);
    regressions.forEach((r) => {
      console.log(`  ❌ ${r.category} / ${r.name}`);
      console.log(`     ${r.baselineAvg}ms → ${r.currentAvg}ms (+${r.percentChange}%)\n`);
    });
  }

  if (improvements.length > 0) {
    console.log(`\n✨ IMPROVEMENTS DETECTED (${improvements.length}):\n`);
    improvements.forEach((imp) => {
      console.log(`  ✅ ${imp.category} / ${imp.name}`);
      console.log(`     ${imp.baselineAvg}ms → ${imp.currentAvg}ms (${imp.percentChange}%)\n`);
    });
  }

  if (regressions.length === 0 && improvements.length === 0) {
    console.log('✓ No significant changes detected.\n');
  }

  console.log('='.repeat(80));

  if (regressions.length > 0) {
    console.log('\n⚠️  Please investigate the regressions above.');
    process.exit(1);
  }
}

detectRegressions();
