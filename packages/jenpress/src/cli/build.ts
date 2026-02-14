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

import { buildSite as buildSiteImpl } from '../node/builder.ts';
import { loadConfig } from '../node/config.ts';

export async function buildSite(cwd: string, args: string[]) {
  try {
    const config = await loadConfig(cwd);
    console.log(`\n🔨 Building JenPress...`);
    console.log(`📖 Docs: ${config.srcDir || 'docs'}`);
    console.log(`📦 Output: ${config.outDir || 'dist'}`);
    
    await buildSiteImpl(cwd, { config });
    
    console.log(`\n✅ Build complete!`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}
