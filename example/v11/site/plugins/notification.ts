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

/**
 * Notification Plugin
 * Simple toast/notification system
 */

interface NotificationOptions {
  duration?: number;
  type?: "info" | "success" | "warning" | "error";
  onDismiss?: () => void;
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
}

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  notify(message: string, options: NotificationOptions = {}) {
    const id = this.generateId();
    const notification: Notification = {
      id,
      message,
      type: options.type || "info",
      timestamp: Date.now(),
    };

    this.notifications.set(id, notification);
    this.broadcastUpdate();

    const duration = options.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.notify(message, { type: "success", duration });
  }

  error(message: string, duration?: number) {
    return this.notify(message, { type: "error", duration });
  }

  warning(message: string, duration?: number) {
    return this.notify(message, { type: "warning", duration });
  }

  info(message: string, duration?: number) {
    return this.notify(message, { type: "info", duration });
  }

  dismiss(id: string) {
    this.notifications.delete(id);
    this.broadcastUpdate();
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcastUpdate() {
    const notifications = this.getAll();
    this.listeners.forEach((listener) => listener(notifications));
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const notifications = new NotificationManager();
