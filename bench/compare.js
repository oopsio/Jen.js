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
 * Benchmark Comparison Script
 * Compares current benchmark results against baseline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baselineFile = path.join(__dirname, 'baseline.json');
const resultsFile = path.join(__dirname, 'results.json');

function compareResults() {
  if (!fs.existsSync(resultsFile)) {
    console.error('❌ No results.json found. Run benchmarks first with: npm run bench');
    process.exit(1);
  }

  if (!fs.existsSync(baselineFile)) {
    console.error('❌ No baseline.json found');
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf-8'));
  const current = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));

  console.log('\n📊 Benchmark Comparison\n');
  console.log('='.repeat(80));

  let regressions = 0;
  let improvements = 0;
  let unchanged = 0;

  const compareCategory = (category, baseBench, currBench) => {
    console.log(`\n${category.toUpperCase()}`);
    console.log('-'.repeat(80));

    for (const [name, baselineData] of Object.entries(baseBench)) {
      const currentData = currBench[name];

      if (!currentData) {
        console.log(`  ⚠️  ${name} - NOT FOUND IN CURRENT RESULTS`);
        continue;
      }

      const baseAvg = baselineData.avg;
      const currAvg = currentData.avg;
      const diff = currAvg - baseAvg;
      const percentChange = ((diff / baseAvg) * 100).toFixed(2);

      let status = '✓';
      let symbol = '≈';

      if (Math.abs(diff) > baselineData.avg * 0.05) {
        if (diff > 0) {
          status = '⚠️ SLOWER';
          symbol = '↑';
          regressions++;
        } else {
          status = '✨ FASTER';
          symbol = '↓';
          improvements++;
        }
      } else {
        status = '✓ SAME';
        unchanged++;
      }

      console.log(`  ${status} ${name}`);
      console.log(`     Baseline: ${baseAvg.toFixed(2)}ms | Current: ${currAvg.toFixed(2)}ms | ${symbol} ${percentChange}%`);
    }
  };

  if (baseline.benchmarks && current.benchmarks) {
    for (const category of Object.keys(baseline.benchmarks)) {
      if (current.benchmarks[category]) {
        compareCategory(category, baseline.benchmarks[category], current.benchmarks[category]);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📈 Summary:`);
  console.log(`  ✨ Improvements: ${improvements}`);
  console.log(`  ⚠️  Regressions: ${regressions}`);
  console.log(`  ✓ Unchanged: ${unchanged}`);

  if (regressions > 0) {
    console.log(`\n⚠️  ${regressions} performance regression(s) detected!`);
    process.exit(1);
  } else {
    console.log('\n✅ No regressions detected!');
  }
}

compareResults();
