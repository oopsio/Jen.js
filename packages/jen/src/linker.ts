export interface AppConfig {
  name: string;
  url: string;
  zone: {
    basePath: string;
    assetPrefix?: string;
  };
}

/**
 * Generates a master rewrites configuration for a gateway (like Nginx or Vercel)
 * to connect multiple Jen.js localized zones/deployments into one cohesive router.
 *
 * @param apps Array of Jen.js applications
 * @param gateway Defines whether to output a Vercel config.json or an Nginx conf
 * @returns Object or string containing gateway configuration
 */
export function linkApps(
  apps: AppConfig[],
  gateway: 'vercel' | 'nginx' = 'vercel',
) {
  if (gateway === 'vercel') {
    return {
      version: 3,
      routes: apps.map((app) => ({
        src: `${app.zone.basePath}/?(.*)`,
        dest: `${app.url.replace(/\/$/, '')}/$1`,
      })),
    };
  }

  if (gateway === 'nginx') {
    let nginxConfig = '';
    for (const app of apps) {
      nginxConfig += `
location ${app.zone.basePath} {
    proxy_pass ${app.url.replace(/\/$/, '')};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
`;
    }
    return nginxConfig.trim();
  }

  throw new Error(`Unsupported gateway: ${gateway}`);
}
