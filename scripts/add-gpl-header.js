import fs from 'fs';
import path from 'path';

// ==== CONFIG ====
const projectName = "Jen.js"; // change to your project name
const author = "oopsio";    // change to your name

// Supported extensions and their comment style
const commentStyles = {
  '.c': 'block', '.cc': 'block', '.cpp': 'block',
  '.h': 'block', '.hh': 'block', '.cs': 'block',
  '.ts': 'block', '.tsx': 'block', '.js': 'block',
  '.jsx': 'block', '.mjs': 'block', '.mts': 'block',
  '.py': 'hash', '.rb': 'hash', '.rs': 'hash',
  '.lua': 'hash', '.php': 'hash',
  '.svelte': 'block', '.vue': 'block', '.astro': 'block',
  '.coffee': 'block'
};

// ==== HEADER GENERATOR ====
function makeHeader(style) {
  const text = `This file is part of ${projectName}.
Copyright (C) 2026 ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.`;

  switch (style) {
    case 'block':
      return `/*\n${text.split('\n').map(l => ' * ' + l).join('\n')}\n */\n\n`;
    case 'hash':
      return text.split('\n').map(l => '# ' + l).join('\n') + '\n\n';
    default:
      return '';
  }
}

// ==== WALK DIRECTORY ====
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, dist, and hidden/system folders
    if (entry.isDirectory() && !['node_modules', 'dist', '.git'].includes(entry.name)) {
      walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (commentStyles[ext]) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Skip if file already has GPL header
        if (!content.includes('GNU General Public License')) {
          const header = makeHeader(commentStyles[ext]);
          fs.writeFileSync(fullPath, header + content, 'utf-8');
          console.log(`Added header to: ${fullPath}`);
        }
      }
    }
  }
}

// ==== RUN ====
walk('./'); // run in current working directory