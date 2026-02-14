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

export function addCommand(args) {
  const type = args[0];
  const name = args[1];
  if (!type || !name) {
    console.log("Usage: jen add <page|plugin> <name>");
    return;
  }

  switch (type) {
    case "page":
      addPage(name);
      break;
    case "plugin":
      addPlugin(name);
      break;
    default:
      console.log("Unknown type. Use 'page' or 'plugin'");
  }
}

function addPage(name) {
  const fileName = `${name}.tsx`;
  const pagesDir = path.resolve("site");
  if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir);
  fs.writeFileSync(
    path.join(pagesDir, fileName),
    `export default function ${name}() { return <div>${name}</div>; }`,
  );
  console.log(`Created page: ${fileName}`);
}

function addPlugin(name) {
  const fileName = `${name}.lua`;
  const pluginDir = path.resolve("src/plugin/plugins");
  if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true });
  fs.writeFileSync(
    path.join(pluginDir, fileName),
    `return function(hook, ctx)\n  print("[Plugin ${name}] hook", hook)\nend`,
  );
  console.log(`Created plugin: ${fileName}`);
}
