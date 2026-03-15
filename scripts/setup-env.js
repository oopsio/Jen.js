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
 * Environment Setup Script
 * Initializes .env file with sensible defaults based on NODE_ENV
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const ENV = process.env.NODE_ENV || 'development';
const envFile = path.join(rootDir, '.env');
const envTemplate = path.join(rootDir, `.env.${ENV}`);

async function setupEnv() {
  try {
    console.log(` Setting up environment for: ${ENV}`);

    // Check if .env exists
    if (fs.existsSync(envFile)) {
      console.log(' .env file already exists, skipping...');
      return;
    }

    // Check if environment-specific file exists
    if (fs.existsSync(envTemplate)) {
      fs.copyFileSync(envTemplate, envFile);
      console.log(` Created .env from .env.${ENV}`);
    } else {
      // Fallback to .env.example
      const exampleFile = path.join(rootDir, '.env.example');
      if (fs.existsSync(exampleFile)) {
        fs.copyFileSync(exampleFile, envFile);
        console.log(' Created .env from .env.example');
      } else {
        console.error(' No .env template found');
        process.exit(1);
      }
    }

    // Generate secrets if needed
    if (ENV === 'development' || ENV === 'test') {
      updateEnvSecrets(envFile);
    }

    console.log(' Environment setup complete!');
  } catch (error) {
    console.error(' Error setting up environment:', error.message);
    process.exit(1);
  }
}

function updateEnvSecrets(envFile) {
  let content = fs.readFileSync(envFile, 'utf-8');

  // Generate random secrets if placeholders exist
  if (content.includes('your-super-secret-key-change-this-in-production')) {
    const crypto = require('crypto');
    const secret = crypto.randomBytes(32).toString('hex');
    content = content.replace(
      'your-super-secret-key-change-this-in-production',
      secret
    );
    console.log(' Generated JWT_SECRET');
  }

  if (content.includes('your-session-secret-change-in-production')) {
    const crypto = require('crypto');
    const secret = crypto.randomBytes(32).toString('hex');
    content = content.replace(
      'your-session-secret-change-in-production',
      secret
    );
    console.log(' Generated SESSION_SECRET');
  }

  fs.writeFileSync(envFile, content);
}

setupEnv();
