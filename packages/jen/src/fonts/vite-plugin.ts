import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const collectedUrls = new Set<string>();

const fetchUrl = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
        (res) => {
          if (
            res.statusCode !== 200 &&
            res.statusCode !== 301 &&
            res.statusCode !== 302
          ) {
            return reject(new Error(`Failed to fetch ${url}`));
          }
          if (res.statusCode === 301 || res.statusCode === 302) {
            return fetchUrl(res.headers.location as string)
              .then(resolve)
              .catch(reject);
          }
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        },
      )
      .on('error', reject);
  });
};

/**
 * Jen.js Font Optimization Plugin
 * Handles build-time font downloads for production
 */
export function jenFontPlugin(): Plugin {
  return {
    name: 'vite-plugin-jen-font',

    // In production build, we intercept GoogleFont calls to collect URLs
    transform(code, id) {
      if (
        process.env.NODE_ENV === 'production' &&
        (id.endsWith('.tsx') || id.endsWith('.ts'))
      ) {
        const matches = code.matchAll(
          /GoogleFont\(['"]([^'"]+)['"](?:,\s*({[^}]+}))?\)/g,
        );
        for (const match of matches) {
          const fontName = match[1];
          let weightString = '400';
          let display = 'swap';
          let subsetString = 'latin';

          const optionsStr = match[2];
          if (optionsStr) {
            const weightMatch = optionsStr.match(
              /weight:\s*(?:['"]([^'"]+)['"]|(\d+))/,
            );
            if (weightMatch) weightString = weightMatch[1] || weightMatch[2];

            const displayMatch = optionsStr.match(
              /display:\s*['"]([^'"]+)['"]/,
            );
            if (displayMatch) display = displayMatch[1];

            const subsetsMatch = optionsStr.match(/subsets:\s*\[([^\]]+)\]/);
            if (subsetsMatch) {
              subsetString = subsetsMatch[1].replace(/['"\s]/g, '');
            }
          }

          const googleUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weightString}&display=${display}&subset=${subsetString}`;
          collectedUrls.add(googleUrl);
        }
      }
      return null;
    },

    async generateBundle() {
      if (process.env.NODE_ENV !== 'production') return;
      if (collectedUrls.size === 0) return;

      const fontsDir = path.join(process.cwd(), 'dist', 'fonts');
      if (!fs.existsSync(fontsDir)) {
        fs.mkdirSync(fontsDir, { recursive: true });
      }

      for (const url of collectedUrls) {
        try {
          const cssBuffer = await fetchUrl(url);
          let css = cssBuffer.toString('utf8');

          const urlRegex = /url\((https:\/\/[^)]+\.woff2)\)/g;
          const woff2Urls = new Set<string>();
          for (const match of css.matchAll(urlRegex)) {
            woff2Urls.add(match[1]);
          }

          for (const woffUrl of woff2Urls) {
            const woffBuffer = await fetchUrl(woffUrl);
            const fileName = woffUrl.split('/').pop() || 'font.woff2';

            const woffPath = path.join(fontsDir, fileName);
            fs.writeFileSync(woffPath, woffBuffer);

            // Rewrite CSS
            css = css.replace(
              new RegExp(woffUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              `/fonts/${fileName}`,
            );
          }

          const urlObj = new URL(url);
          const familyParams = urlObj.searchParams.get('family') || 'font';
          const cssName =
            familyParams
              .split(':')[0]
              .replace(/[^a-zA-Z0-9]/g, '-')
              .toLowerCase() + '.css';

          fs.writeFileSync(path.join(fontsDir, cssName), css);
        } catch (e) {
          console.warn('[jenFontPlugin] Failed to download font:', e);
        }
      }
    },
  };
}
