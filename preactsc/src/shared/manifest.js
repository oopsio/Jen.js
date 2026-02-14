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

import path from "path";

export function createManifest(clientPaths, outDir) {
  const manifest = [];
  const seenIds = new Set();

  clientPaths.forEach((filePath, index) => {
    // Security: Validate file path
    if (!filePath || typeof filePath !== "string") {
      console.warn(`[PRSC] Invalid file path: ${filePath}`);
      return;
    }

    // Security: Only allow relative paths starting with .
    const normalizedPath = filePath.replace(/\\/g, "/");
    if (!normalizedPath.startsWith(".") && !normalizedPath.startsWith("/")) {
      console.warn(`[PRSC] Invalid manifest path: ${normalizedPath}`);
      return;
    }

    const id = `client-${index}`;

    // Security: Prevent duplicate IDs
    if (seenIds.has(id)) {
      console.warn(`[PRSC] Duplicate component id: ${id}`);
      return;
    }
    seenIds.add(id);

    const name = path.basename(filePath).replace(/\.[jt]sx?$/, "");

    manifest.push({
      id,
      name: name.replace(/[^a-z0-9_-]/gi, "_"), // Sanitize name
      path: normalizedPath,
      props: {},
    });
  });

  return manifest;
}

export function createComponentId(filePath) {
  return path
    .basename(filePath)
    .replace(/\.[jt]sx?$/, "")
    .toLowerCase();
}

export function serializeManifest(components) {
  return JSON.stringify(
    components.map((c, i) => ({
      id: i,
      path: c.path,
      name: c.name,
      props: c.props || {},
    })),
  );
}
