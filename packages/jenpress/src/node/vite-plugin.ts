import type { Plugin } from 'vite';
import { transformMarkdownFile } from './markdown/transform.js';
import { resolve } from 'path'

export interface JenPressPluginOptions {
  srcDir?: string;
  docsDir?: string;
  include?: string[];
  exclude?: string[];
}

export function createVitePressPlugin(options: JenPressPluginOptions = {}): Plugin {
  const { srcDir = process.cwd(), docsDir = 'docs' } = options;
  const docsAbsolute = resolve(srcDir, docsDir);

  return {
    name: 'vite-plugin-jenpress',
    resolveId(id) {
      if (id.endsWith('.md')) {
        return id;
      }
    },
    async load(id) {
      if (!id.endsWith('.md')) {
        return null;
      }

      try {
        return await transformMarkdownFile(id);
      } catch (error) {
        console.error(`Error transforming ${id}:`, error);
        throw error;
      }
    },
  };
}

export default createVitePressPlugin;
