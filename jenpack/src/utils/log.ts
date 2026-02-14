/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = LogLevel.INFO;

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function formatTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
  currentLogLevel = LogLevel[level.toUpperCase() as keyof typeof LogLevel];
}

export function debug(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`${colors.gray}[${formatTime()}]${colors.reset}`, ...args);
  }
}

export function info(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`${colors.cyan}[${formatTime()}]${colors.reset}`, ...args);
  }
}

export function success(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`${colors.green}✓${colors.reset}`, ...args);
  }
}

export function warn(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`${colors.yellow}⚠${colors.reset}`, ...args);
  }
}

export function error(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`${colors.red}✗${colors.reset}`, ...args);
  }
}

export function time(label: string): { end: () => number } {
  const start = Date.now();
  return {
    end: () => {
      const elapsed = Date.now() - start;
      return elapsed;
    },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + sizes[i];
}

export function formatSize(size: number): string {
  return formatBytes(size);
}
