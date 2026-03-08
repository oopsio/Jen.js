const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const HEADER = `/*
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
 */`;

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  ".vercel"
]);

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        scan(full);
      }
      continue;
    }

    if (!entry.isFile()) continue;

    try {
      let content = fs.readFileSync(full, "utf8");

      if (content.includes(HEADER)) {
        const newContent = content.replace(HEADER, "").replace(/^\s*\n/, "");
        fs.writeFileSync(full, newContent);
        console.log("Removed GPL header from:", full);
      }
    } catch {
      // skip binary or unreadable files
    }
  }
}

scan(ROOT);

console.log("Done.");