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
import fs from "fs";
import { startProdServer } from "../server/prod.js";

export async function startCommand(args) {
  if (args.length === 0) {
    throw new Error("Missing output directory: preactsc start <outdir>");
  }

  const outDir = path.resolve(process.cwd(), args[0]);

  if (!fs.existsSync(outDir)) {
    throw new Error(`Output directory not found: ${outDir}`);
  }

  const serverPath = path.join(outDir, "server.js");
  if (!fs.existsSync(serverPath)) {
    throw new Error(`Server bundle not found: ${serverPath}`);
  }

  console.log(`[PRSC] Starting production server from: ${outDir}`);
  await startProdServer(outDir);
}
