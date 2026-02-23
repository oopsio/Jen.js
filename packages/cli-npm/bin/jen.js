#!/usr/bin/env node
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const platform = os.platform(); // 'win32', 'darwin', 'linux'
const arch = os.arch();         // 'x64', 'ia32', 'arm64'

let folder;
let execName = 'jen'; // default binary name

switch (platform) {
  case 'win32':
    folder = arch === 'x64' ? 'jen-windows-amd64' : 'jen-windows-386';
    execName += '.exe';
    break;
  case 'darwin':
    folder = arch === 'x64' ? 'jen-macos-amd64' : 'jen-macos-arm64';
    break;
  case 'linux':
    if (arch === 'x64') folder = 'jen-linux-amd64';
    else if (arch === 'ia32') folder = 'jen-linux-386';
    else if (arch === 'arm64') folder = 'jen-linux-arm64';
    else throw new Error(`Unsupported arch: ${arch}`);
    break;
  default:
    throw new Error(`Unsupported platform: ${platform}`);
}

const binPath = path.join(__dirname, folder, execName);

// Forward all CLI args
const args = process.argv.slice(2);

const child = spawn(binPath, args, { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code);
});