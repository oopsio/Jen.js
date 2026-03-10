/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
export class EventLogger {
  logs = [];
  maxLogs = 1000;
  log(source, type, data) {
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      source,
      type: type,
      message: this.serializeMessage(data),
      data,
    };
    this.logs.push(entry);
    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }
  getLogs() {
    return [...this.logs];
  }
  getLogsSince(timestamp) {
    return this.logs.filter((log) => log.timestamp >= timestamp);
  }
  getLogsBySource(source) {
    return this.logs.filter((log) => log.source === source);
  }
  getLogsByType(type) {
    return this.logs.filter((log) => log.type === type);
  }
  clear() {
    this.logs = [];
  }
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(
      (log) =>
        log.source.toLowerCase().includes(lowerQuery) ||
        log.message.toLowerCase().includes(lowerQuery),
    );
  }
  serializeMessage(data) {
    if (Array.isArray(data)) {
      return data.map((d) => this.serializeValue(d)).join(" ");
    }
    return this.serializeValue(data);
  }
  serializeValue(value) {
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
