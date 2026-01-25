import { join } from "node:path";

export function resolveSitePath(config: { siteDir: string }, ...p: string[]) {
  return join(process.cwd(), config.siteDir, ...p);
}

export function resolveDistPath(config: { distDir: string }, ...p: string[]) {
  return join(process.cwd(), config.distDir, ...p);
}
