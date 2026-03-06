// Lightweight country detection from IP
// Uses MaxMind GeoIP2 Lite database or simple IP range lookup
// For serverless: recommend Cloudflare Workers or edge function integration

import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

let geoDb: Map<string, string> | null = null;

// Simple IP range to country mapping (minimal subset)
// In production, use MaxMind GeoLite2 or similar
// This is a fallback for development/testing
const FALLBACK_RANGES: Array<[number, number, string]> = [
  // US ranges (simplified)
  [16509184, 16777215, "US"], // 1.0.0.0/8
  // India ranges (simplified)
  [17301504, 17301759, "IN"], // 1.32.0.0/11
  // Default
  [0, 4294967295, "US"],
];

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => p > 255 || p < 0)) {
    return 0;
  }
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function lookupInRanges(ipNum: number): string {
  for (const [start, end, country] of FALLBACK_RANGES) {
    if (ipNum >= start && ipNum <= end) {
      return country;
    }
  }
  return "US";
}

export function getCountryCode(ip: string): string {
  // Handle local/invalid IPs
  if (ip === "127.0.0.1" || ip === "localhost" || ip === "unknown") {
    return "LOCAL";
  }

  // Try to load GeoIP database if available
  if (!geoDb) {
    const geoPath = resolve("./geoip.json");
    if (existsSync(geoPath)) {
      try {
        const data = JSON.parse(readFileSync(geoPath, "utf-8"));
        geoDb = new Map(data);
      } catch {
        // Fallback to ranges
      }
    }
  }

  // Use database if available
  if (geoDb && geoDb.has(ip)) {
    return geoDb.get(ip)!;
  }

  // Fallback to IP range lookup
  const ipNum = ipToNumber(ip);
  return lookupInRanges(ipNum);
}
