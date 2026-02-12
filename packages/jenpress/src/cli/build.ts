import { buildSite as buildSiteImpl } from '../node/builder.ts';
import { loadConfig } from '../node/config.ts';

export async function buildSite(cwd: string, args: string[]) {
  try {
    const config = await loadConfig(cwd);
    console.log(`\n🔨 Building JenPress...`);
    console.log(`📖 Docs: ${config.srcDir || 'docs'}`);
    console.log(`📦 Output: ${config.outDir || 'dist'}`);
    
    await buildSiteImpl(cwd, { config });
    
    console.log(`\n✅ Build complete!`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}
