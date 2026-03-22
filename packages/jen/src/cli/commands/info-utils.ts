/**
 * Info command utilities - Gather system and framework diagnostics
 */

import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export type TaskResult = {
  messages?: string;
  output?: string;
  result: 'pass' | 'fail' | 'skipped';
};

export type TaskScript = () => Promise<TaskResult>;

/**
 * Get version of a package
 */
export function getPackageVersion(packageName: string): string {
  try {
    const pkgPath = require.resolve(`${packageName}/package.json`);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version || 'N/A';
  } catch {
    return 'N/A';
  }
}

/**
 * Get version of a binary by running --version
 */
export function getBinaryVersion(binaryName: string): string {
  try {
    return execSync(`${binaryName} --version`, { encoding: 'utf-8' })
      .toString()
      .trim();
  } catch {
    return 'N/A';
  }
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

/**
 * Format duration in ms to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

/**
 * Get Jen.js configuration
 */
export function getJenConfig(): Record<string, unknown> {
  try {
    const configPath = path.join(process.cwd(), 'jen.config.mjs');
    if (!fs.existsSync(configPath)) {
      return { buildDirectory: 'dist', port: 3000 };
    }
    // For ESM config, we'd need dynamic import
    return { buildDirectory: 'dist', port: 3000, source: 'jen.config.mjs' };
  } catch {
    return {};
  }
}

/**
 * Get plugin system info
 */
export function getPluginInfo(): {
  count: number;
  builtin: string[];
} {
  return {
    count: 0,
    builtin: [
      '@jen/vite-integration',
      '@jen/environment',
      '@jen/metrics',
      '@jen/cache',
    ],
  };
}

/**
 * Check if running in special environment
 */
export function getEnvironmentInfo(): Record<string, unknown> {
  const env: Record<string, unknown> = {
    node_env: process.env.NODE_ENV || 'development',
  };

  // Check for CI
  if (process.env.CI) {
    env.ci = true;
    env.ci_provider = process.env.CI_NAME || 'unknown';
  }

  // Check for WSL
  try {
    const releaseFile = fs.readFileSync('/proc/version', 'utf-8');
    if (releaseFile.toLowerCase().includes('microsoft')) {
      env.wsl = true;
    }
  } catch {
    // Not on WSL
  }

  return env;
}

/**
 * Get relevant packages and versions
 */
export function getRelevantPackages(): Record<string, string> {
  const packages = [
    'jen',
    'preact',
    'vite',
    'typescript',
    'esbuild',
    '@types/node',
  ];

  const versions: Record<string, string> = {};
  for (const pkg of packages) {
    versions[pkg] = getPackageVersion(pkg);
  }

  return versions;
}

/**
 * Get system CPU info
 */
export function getCPUInfo() {
  const cpus = os.cpus();
  return {
    count: cpus.length,
    model: cpus[0]?.model || 'Unknown',
    speed: cpus[0]?.speed || 0,
  };
}

/**
 * Get memory info
 */
export function getMemoryInfo() {
  return {
    total_mb: Math.ceil(os.totalmem() / 1024 / 1024),
    available_mb: Math.ceil(os.freemem() / 1024 / 1024),
  };
}
