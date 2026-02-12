/**
 * JenPress - Markdown-first documentation SSG
 */

export type { PageData, SiteConfig, ThemeConfig } from './node/config.ts';
export { defineConfig } from './node/config.js';
export { createVitePressPlugin } from './node/vite-plugin.js';
