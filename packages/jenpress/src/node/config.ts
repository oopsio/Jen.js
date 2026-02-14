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

import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface NavLink {
  text: string;
  link: string;
  activeMatch?: string;
}

export interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

export interface ThemeConfig {
  nav?: NavLink[];
  sidebar?: SidebarItem[];
  logo?: string;
  repo?: string;
  docsUrl?: string;
  docsBranch?: string;
}

export interface MarkdownOptions {
  lineNumbers?: boolean;
  breaks?: boolean;
  typographer?: boolean;
}

export interface SiteConfig {
  title: string;
  description?: string;
  base?: string;
  lang?: string;
  icon?: string;
  logo?: string;
  head?: Array<[string, Record<string, string>]>;
  themeConfig?: ThemeConfig;
  markdown?: MarkdownOptions;
  cleanUrls?: boolean;
  srcDir?: string;
  outDir?: string;
  cacheDir?: string;
}

export interface PageData {
  title: string;
  description?: string;
  path: string;
  url: string;
  frontmatter: Record<string, any>;
  content: string;
  excerpt?: string;
  lastUpdated?: number;
}

export function defineConfig(config: SiteConfig): SiteConfig {
  return {
    title: config.title,
    description: config.description || '',
    base: config.base || '/',
    lang: config.lang || 'en',
    srcDir: config.srcDir || 'docs',
    outDir: config.outDir || 'dist',
    cacheDir: config.cacheDir || '.jenpress-cache',
    cleanUrls: config.cleanUrls !== false,
    ...config,
  };
}

export async function loadConfig(cwd: string): Promise<SiteConfig> {
  const configPath = resolve(cwd, 'jenpress.config.ts');
  
  try {
    const mod = await import(configPath);
    return mod.default || mod;
  } catch (e) {
    // Return default config if not found
    return defineConfig({
      title: 'My Documentation',
    });
  }
}

export function getDefaultConfig(cwd: string): SiteConfig {
  return defineConfig({
    title: 'Documentation',
    description: 'Built with JenPress',
    srcDir: resolve(cwd, 'docs'),
    outDir: resolve(cwd, 'dist'),
    cacheDir: resolve(cwd, '.jenpress-cache'),
  });
}
