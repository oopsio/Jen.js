/**
 * Jen Info Command
 * Displays system and framework diagnostics for debugging
 */

import os from 'os';
import {
  getPackageVersion,
  getBinaryVersion,
  formatBytes,
  formatDuration,
  getJenConfig,
  getPluginInfo,
  getEnvironmentInfo,
  getRelevantPackages,
  getCPUInfo,
  getMemoryInfo,
  TaskResult,
} from './info-utils';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function bold(text: string): string {
  return colorize(text, 'bold');
}

/**
 * Print basic system and framework information
 */
export async function printInfo(): Promise<void> {
  const jenVersion = getPackageVersion('jen');
  const jenConfig = getJenConfig();
  const cpuInfo = getCPUInfo();
  const memoryInfo = getMemoryInfo();
  const envInfo = getEnvironmentInfo();
  const pluginInfo = getPluginInfo();
  const relevantPackages = getRelevantPackages();

  console.log(`
${bold('Jen.js Diagnostic Info')}

${bold('Operating System:')}
  Platform: ${os.platform()}
  Architecture: ${os.arch()}
  OS Version: ${os.version()}
  Total Memory (MB): ${memoryInfo.total_mb}
  Available Memory (MB): ${memoryInfo.available_mb}
  CPU Model: ${cpuInfo.model}
  CPU Cores: ${cpuInfo.count}
  CPU Speed (MHz): ${cpuInfo.speed}

${bold('Runtime:')}
  Node.js: ${process.versions.node}
  npm: ${getBinaryVersion('npm')}
  yarn: ${getBinaryVersion('yarn')}
  pnpm: ${getBinaryVersion('pnpm')}
  bun: ${getBinaryVersion('bun')}

${bold('Environment:')}
  NODE_ENV: ${envInfo.node_env}
  CI: ${envInfo.ci ? 'true' : 'false'}${envInfo.ci_provider ? ` (${envInfo.ci_provider})` : ''}
  WSL: ${envInfo.wsl ? 'true' : 'false'}

${bold('Jen.js Framework:')}
  Version: ${jenVersion}
  Build Directory: ${jenConfig.buildDirectory || 'dist'}
  Port: ${jenConfig.port || 3000}
  Plugin System: ${pluginInfo.count} custom + ${pluginInfo.builtin.length} built-in

${bold('Relevant Packages:')}
${Object.entries(relevantPackages)
  .map(([name, version]) => `  ${name}: ${version}`)
  .join('\n')}

${bold('Framework Configuration:')}
  middleware: ${jenConfig.middleware?.enabled !== false ? 'enabled' : 'disabled'}
  isr: ${jenConfig.isr?.enabled !== false ? 'enabled' : 'disabled'}
  config_file: ${jenConfig.source || 'default'}
`);
}

/**
 * Print detailed diagnostics
 */
export async function printVerboseInfo(): Promise<void> {
  console.log(`
${bold('='.repeat(60))}
${bold('Jen.js Verbose Diagnostics')}
${bold('='.repeat(60))}

${bold('NODE PROCESS VERSIONS')}
${'─'.repeat(60)}
${JSON.stringify(process.versions, null, 2)}

${bold('MEMORY USAGE (bytes)')}
${'─'.repeat(60)}
${JSON.stringify(process.memoryUsage(), null, 2)}

${bold('RUNTIME INFO')}
${'─'.repeat(60)}
${JSON.stringify({
  cwd: process.cwd(),
  pid: process.pid,
  platform: process.platform,
  arch: process.arch,
  NODE_ENV: process.env.NODE_ENV,
  uptime: process.uptime() + 's',
}, null, 2)}

${bold('='.repeat(60))}
Generated: ${new Date().toISOString()}
${bold('='.repeat(60))}
`);
}

function isFileSystemWritable(): boolean {
  try {
    const testFile = `${os.tmpdir()}/.jen-test-${Date.now()}`;
    require('fs').writeFileSync(testFile, 'test');
    require('fs').unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
}

function isNodeModulesAccessible(): boolean {
  try {
    require.resolve('preact');
    return true;
  } catch {
    return false;
  }
}

function generateRecommendations(
  jenVersion: string,
  packages: Record<string, string>,
): string[] {
  const recommendations: string[] = [];

  // Check TypeScript
  if (packages.typescript === 'N/A') {
    recommendations.push(
      `  ${colorize('⚠', 'yellow')} TypeScript not installed. Install with: npm install -D typescript`,
    );
  }

  // Check Node version
  const nodeVersion = process.versions.node.split('.')[0];
  if (parseInt(nodeVersion) < 16) {
    recommendations.push(
      `  ${colorize('✗', 'red')} Node.js ${nodeVersion} is outdated. Upgrade to Node 16+`,
    );
  } else {
    recommendations.push(
      `  ${colorize('✓', 'green')} Node.js version is compatible`,
    );
  }

  // Check critical dependencies
  const criticalDeps = ['preact', 'vite', 'esbuild'];
  for (const dep of criticalDeps) {
    if (packages[dep] !== 'N/A') {
      recommendations.push(`  ${colorize('✓', 'green')} ${dep} installed`);
    } else {
      recommendations.push(
        `  ${colorize('✗', 'red')} ${dep} missing. Install with: npm install ${dep}`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(`  ${colorize('✓', 'green')} All checks passed!`);
  }

  return recommendations;
}

/**
 * Main info command handler
 */
export async function handleInfoCommand(verbose: boolean = false): Promise<void> {
  try {
    if (verbose) {
      await printVerboseInfo();
    } else {
      await printInfo();
      console.log(
        `\n${bold('Tip:')} Run ${colorize('jen info --verbose', 'cyan')} for more detailed diagnostics.`,
      );
    }
  } catch (error) {
    console.error(
      `${colorize('Error:', 'red')} Failed to gather diagnostics: ${error}`,
    );
    if (error instanceof Error) {
      console.error(`\n${bold('Stack trace:')}\n${error.stack}`);
    }
    process.exit(1);
  }
}
