/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

export interface LogEntry {
  id: string;
  timestamp: number;
  source: string;
  type: "log" | "error" | "warn" | "info" | "debug";
  message: string;
  data: any;
}

export class EventLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(source: string, type: string, data: any) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      source,
      type: type as any,
      message: this.serializeMessage(data),
      data,
    };

    this.logs.push(entry);

    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsSince(timestamp: number): LogEntry[] {
    return this.logs.filter((log) => log.timestamp >= timestamp);
  }

  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter((log) => log.source === source);
  }

  getLogsByType(type: string): LogEntry[] {
    return this.logs.filter((log) => log.type === type);
  }

  clear() {
    this.logs = [];
  }

  search(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(
      (log) =>
        log.source.toLowerCase().includes(lowerQuery) ||
        log.message.toLowerCase().includes(lowerQuery),
    );
  }

  private serializeMessage(data: any): string {
    if (Array.isArray(data)) {
      return data.map((d) => this.serializeValue(d)).join(" ");
    }
    return this.serializeValue(data);
  }

  private serializeValue(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return String(value);
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "[Object]";
      }
    }
    return String(value);
  }
}
