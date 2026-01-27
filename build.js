import esbuild from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Transpile TypeScript root and src files to JavaScript
const outdir = join(__dirname, '.esbuild');
await esbuild.build({
  entryPoints: [
    join(__dirname, 'build.ts'),
    join(__dirname, 'src/build/build.ts'),
    join(__dirname, 'src/core/routes/scan.ts'),
    join(__dirname, 'src/core/routes/match.ts'),
    join(__dirname, 'src/core/config.ts'),
    join(__dirname, 'src/core/paths.ts'),
    join(__dirname, 'src/core/types.ts'),
    join(__dirname, 'src/runtime/render.ts'),
    join(__dirname, 'src/shared/log.ts'),
    join(__dirname, 'src/css/compiler.ts'),
    join(__dirname, 'jen.config.ts'),
  ],
  outdir,
  outbase: __dirname,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  bundle: false,
  logLevel: 'silent'
});

// Now execute the transpiled build.js
const buildJS = join(outdir, 'build.js');
const result = await import(pathToFileURL(buildJS).href);

