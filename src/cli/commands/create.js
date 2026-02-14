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

import fs from "fs";
import path from "path";

export function createCommand(args) {
  const name = args[0];
  const template = args[1]?.split("=")[1] || "ssg";
  if (!name) {
    console.log("Usage: myfw create <name> --template=<ssg|ssr>");
    return;
  }

  const projectDir = path.resolve(name);
  if (fs.existsSync(projectDir)) {
    console.log("Error: Directory already exists");
    return;
  }

  fs.mkdirSync(projectDir, { recursive: true });

  // Copy template files
  const templateDir = path.resolve("src/cli/templates", template);
  copyFolder(templateDir, projectDir);

  console.log(
    `Created new app '${name}' using ${template.toUpperCase()} template`,
  );
}

// Recursively copy folder
function copyFolder(src, dest) {
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
