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

import { startDevServer } from '../node/dev-server.ts';
import { loadConfig } from '../node/config.ts';

export async function devServer(cwd: string, args: string[]) {
  try {
    const config = await loadConfig(cwd);
    console.log(`\n📚 JenPress Dev Server`);
    console.log(`📖 Docs: ${config.srcDir || 'docs'}`);
    
    const { server } = await startDevServer(cwd);

    // Handle shutdown
    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start dev server:', error);
    process.exit(1);
  }
}
