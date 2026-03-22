import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Buffer } from 'node:buffer';
import path from 'node:path';

/**
 * Build-time font downloader
 */
export async function downloadFont(url: string, outputDir: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });
  const css = await response.text();

  // Parse CSS to find font files
  const fontUrls = css.match(/url\((.*?)\)/g)?.map((u) => u.slice(4, -1)) || [];

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let localCss = css;
  for (const fontUrl of fontUrls) {
    const fontResponse = await fetch(fontUrl);
    const fontBuffer = await fontResponse.arrayBuffer();
    const fileName = path.basename(new URL(fontUrl).pathname);
    writeFileSync(join(outputDir, fileName), Buffer.from(fontBuffer));
    localCss = localCss.replace(fontUrl, `/fonts/${fileName}`);
  }

  writeFileSync(join(outputDir, 'fonts.css'), localCss);
}
