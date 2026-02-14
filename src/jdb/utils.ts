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

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function readJSON<T>(file: string): Promise<T | null> {
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data);
  } catch (e: any) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

export async function writeJSON(file: string, data: any) {
  const tempFile = `${file}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
  await fs.rename(tempFile, file);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function matchFilter(doc: any, filter: any): boolean {
  for (const key in filter) {
    if (key === "$or") {
      if (!filter.$or.some((f: any) => matchFilter(doc, f))) return false;
      continue;
    }
    if (key === "$and") {
      if (!filter.$and.every((f: any) => matchFilter(doc, f))) return false;
      continue;
    }

    const val = doc[key];
    const cond = filter[key];

    if (typeof cond === "object" && cond !== null && !Array.isArray(cond)) {
      for (const op in cond) {
        const target = cond[op];
        switch (op) {
          case "$eq":
            if (val !== target) return false;
            break;
          case "$ne":
            if (val === target) return false;
            break;
          case "$gt":
            if (!(val > target)) return false;
            break;
          case "$gte":
            if (!(val >= target)) return false;
            break;
          case "$lt":
            if (!(val < target)) return false;
            break;
          case "$lte":
            if (!(val <= target)) return false;
            break;
          case "$in":
            if (!target.includes(val)) return false;
            break;
          case "$nin":
            if (target.includes(val)) return false;
            break;
          case "$regex":
            if (!new RegExp(target).test(val)) return false;
            break;
        }
      }
    } else {
      if (val !== cond) return false;
    }
  }
  return true;
}

export function applyUpdate(doc: any, update: any) {
  const now = Date.now();
  doc._updated = now;

  for (const op in update) {
    const fields = update[op];
    for (const key in fields) {
      const val = fields[key];
      switch (op) {
        case "$set":
          doc[key] = val;
          break;
        case "$unset":
          delete doc[key];
          break;
        case "$inc":
          doc[key] = (doc[key] || 0) + val;
          break;
        case "$push":
          if (!Array.isArray(doc[key])) doc[key] = [];
          doc[key].push(val);
          break;
        case "$pull":
          if (Array.isArray(doc[key])) {
            doc[key] = doc[key].filter((item: any) => item !== val);
          }
          break;
      }
    }
  }
}
