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

export type RenderMode = "ssr" | "ssg" | "isr" | "ppr";

export type FrameworkConfig = {
  siteDir: string;
  distDir: string;

  routes: {
    fileExtensions: string[];
    routeFilePattern: RegExp;
    enableIndexFallback: boolean;
  };

  rendering: {
    defaultMode: RenderMode;
    defaultRevalidateSeconds: number;
  };

  inject: {
    head: string[];
    bodyEnd: string[];
  };

  css: {
    globalScss: string;
    criticalBudget?: number;
    extractCritical?: boolean;
  };

  assets: {
    publicDir: string;
    cacheControl: string;
    hashLength?: number;
  };

  server: {
    port: number;
    hostname: string;
  };

  build?: {
    minifyHtml?: boolean;
    minifyCss?: boolean;
    minifyJs?: boolean;
    hashAssets?: boolean;
    generateManifest?: boolean;
    generateSitemap?: boolean;
    cacheDir?: string;
    incrementalBuild?: boolean;
    sourceMap?: boolean;
  };

  dev?: {
    enableSSR?: boolean;
    liveReload?: boolean;
    port?: number;
  };

  seo?: {
    generateRobotsTxt?: boolean;
    generateSitemap?: boolean;
    sitemapBaseUrl?: string;
  };
};
