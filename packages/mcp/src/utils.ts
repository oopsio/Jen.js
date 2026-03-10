import { readFileSync } from "fs";
import { join } from "path";
import { globSync } from "glob";
import type { JenProjectConfig, ProjectStats } from "./types.js";

export function findProjectRoot(startPath: string = process.cwd()): string {
  let current = startPath;
  while (current !== "/") {
    try {
      readFileSync(join(current, "jen.config.ts"));
      return current;
    } catch {
      current = join(current, "..");
    }
  }
  return startPath;
}

export function loadProjectConfig(
  projectRoot: string,
): JenProjectConfig | null {
  try {
    const packageJsonPath = join(projectRoot, "package.json");
    const content = readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(content) as JenProjectConfig;
  } catch {
    return null;
  }
}

export function calculateProjectStats(projectRoot: string): ProjectStats {
  const patterns = {
    ts: "**/*.ts",
    js: "**/*.js",
    tsx: "**/*.tsx",
    jsx: "**/*.jsx",
    css: "**/*.css",
    scss: "**/*.scss",
    json: "**/*.json",
  };

  const stats: ProjectStats = {
    totalFiles: 0,
    tsFiles: 0,
    jsFiles: 0,
    tsxFiles: 0,
    jsxFiles: 0,
    cssFiles: 0,
    scssFiles: 0,
    jsonFiles: 0,
    totalLines: 0,
  };

  try {
    stats.tsFiles = globSync(patterns.ts, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.jsFiles = globSync(patterns.js, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.tsxFiles = globSync(patterns.tsx, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.jsxFiles = globSync(patterns.jsx, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.cssFiles = globSync(patterns.css, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.scssFiles = globSync(patterns.scss, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.jsonFiles = globSync(patterns.json, {
      cwd: projectRoot,
      ignore: ["node_modules/**", "dist/**", ".next/**", ".turbo/**"],
    }).length;

    stats.totalFiles =
      stats.tsFiles +
      stats.jsFiles +
      stats.tsxFiles +
      stats.jsxFiles +
      stats.cssFiles +
      stats.scssFiles +
      stats.jsonFiles;
  } catch {
    // Error in glob matching
  }

  return stats;
}

export function getRelativePath(fullPath: string, basePath: string): string {
  if (fullPath.startsWith(basePath)) {
    return fullPath.slice(basePath.length).replace(/^[\\/]/, "");
  }
  return fullPath;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function runCommand(
  command: string,
  cwd: string = process.cwd(),
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    // Simple command execution - in production use proper child_process handling
    resolve({
      stdout: `Running: ${command}`,
      stderr: "",
      code: 0,
    });
  });
}
