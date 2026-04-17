// src/config/ConfigLoader.ts
import path from 'node:path';
import fs from 'fs-extra';
import { updateRuntimeConfig } from './config.js';

export class ConfigLoader {
  public static async initialize(): Promise<void> {
    const configPath = path.resolve(process.cwd(), 'jen.config.mjs');

    if (!fs.existsSync(configPath)) {
      return;
    }

    try {
      const userConfigModule = await import(/* @vite-ignore */ configPath);
      const userConfig = userConfigModule.default || {};

      updateRuntimeConfig(userConfig);
    } catch (error) {
      console.error('Failed to load jen.config.mjs:', error);
    }
  }
}
