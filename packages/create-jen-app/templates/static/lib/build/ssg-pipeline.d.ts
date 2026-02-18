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

import { FrameworkConfig } from "../core/config.js";
export declare class SSGPipeline {
  private config;
  private dist;
  constructor(config: FrameworkConfig);
  /**
   * Run the full SSG Pipeline
   */
  run(): Promise<void>;
  private prepareDist;
  private processAssets;
  private compileStyles;
  private renderPages;
  private copyRecursive;
}
