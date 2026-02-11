#!/usr/bin/env node
/**
 * Database Seeding Script
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🌱 Seeding database for ${env} environment...`);

  try {
    // Import seed runner
    const { runSeeds } = await import('./seeds/runner.js');

    const result = await runSeeds({
      environment: env,
      verbose: true,
    });

    console.log('✅ Seeding completed successfully');
    console.log(`📊 Records created: ${result.count}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
