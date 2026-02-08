import { join } from "node:path";
export function resolveSitePath(config, ...p) {
  return join(process.cwd(), config.siteDir, ...p);
}
export function resolveDistPath(config, ...p) {
  return join(process.cwd(), config.distDir, ...p);
}
