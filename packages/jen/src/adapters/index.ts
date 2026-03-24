import { CloudflareAdapter } from './cloudflare.js';
import { VercelAdapter } from './vercel.js';

export interface AdapterOptions {
  outDir: string;
  rootDir: string;
}

export class AdapterManager {
  public static async build(adapterName: string, options: AdapterOptions) {
    switch (adapterName.toLowerCase()) {
      case 'cloudflare':
        await CloudflareAdapter.build(options);
        break;
      case 'vercel':
        await VercelAdapter.build(options);
        break;
      default:
        console.error(`\x1b[31mUnknown adapter: ${adapterName}\x1b[0m`);
        process.exit(1);
    }
  }
}
