#!/usr/bin/env node
/**
 * Database Migration Script
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🗄️  Running migrations for ${env} environment...`);

  try {
    // Import migration runner
    const { runMigrations } = await import('./migrations/runner.js');

    const result = await runMigrations({
      environment: env,
      direction: 'up',
      verbose: true,
    });

    console.log('✅ Migrations completed successfully');
    console.log(`📊 Migrations run: ${result.count}`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
