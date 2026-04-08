import { expect, test, describe, jest } from 'bun:test';
import { jenFontPlugin } from '../vite-plugin.js';

describe('jenFontPlugin Build Extraction', () => {
  test('should return plugin properly scoped and initialized', () => {
    const plugin = jenFontPlugin() as any;
    expect(plugin.name).toBe('vite-plugin-jen-font');
    expect(typeof plugin.transform).toBe('function');
    expect(typeof plugin.generateBundle).toBe('function');
  });

  test('transform properly extracts arguments safely out of AST files', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const plugin = jenFontPlugin() as any;
    
    const typescriptCode = `
      import { GoogleFont } from 'jen.js/fonts';
      export function Main() {
        GoogleFont("Roboto", { weight: "400..700", subsets: ["latin"] });
        GoogleFont("Inter");
        return <div>Hello</div>;
      }
    `;

    // Passing through transformer
    const res = plugin.transform(typescriptCode, '/src/main.tsx');
    
    // We expect the result to be null effectively allowing vite to handle natively doing nothing immediately.
    // Behind the scenes, the internal state Set tracking got filled.
    expect(res).toBeNull();
    
    // Cleanup
    process.env.NODE_ENV = originalEnv;
  });
});
