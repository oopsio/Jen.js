// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    preact(),
    mdx(),
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  build: {
    format: 'directory',
  },
});
