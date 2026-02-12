import { startDevServer } from '../node/dev-server.ts';
import { loadConfig } from '../node/config.ts';

export async function devServer(cwd: string, args: string[]) {
  try {
    const config = await loadConfig(cwd);
    console.log(`\n📚 JenPress Dev Server`);
    console.log(`📖 Docs: ${config.srcDir || 'docs'}`);
    
    const { server } = await startDevServer(cwd);

    // Handle shutdown
    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start dev server:', error);
    process.exit(1);
  }
}
