/**
 * DevTools WebSocket Client
 * Communicates with the DevTools Server sidecar
 */

import type { DevToolsMessage } from './types.js';

export class DevToolsClient {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: DevToolsMessage[] = [];
  private requestIdCounter = 0;
  private pendingRequests = new Map<string, (data: unknown) => void>();

  constructor(wsUrl: string = 'ws://localhost:3001') {
    this.wsUrl = wsUrl;
    this.connect();
  }

  /**
   * Establish WebSocket connection
   */
  private connect(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('[DevTools] Connected');
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.sendHeartbeat();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: DevToolsMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[DevTools] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error: Event) => {
        console.error('[DevTools] WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.warn('[DevTools] Disconnected, attempting reconnect...');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[DevTools] Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(
        `[DevTools] Max reconnect attempts (${this.maxReconnectAttempts}) reached`,
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[DevTools] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`,
    );
    setTimeout(() => this.connect(), delay);
  }

  /**
   * Send message to DevTools server
   */
  public async send(type: string, data: unknown): Promise<void> {
    const message: DevToolsMessage = {
      type: type as DevToolsMessage['type'],
      timestamp: Date.now(),
      data,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Send request and wait for response
   */
  public async request(type: string, data: unknown): Promise<unknown> {
    const requestId = `req-${++this.requestIdCounter}`;

    return new Promise((resolve) => {
      this.pendingRequests.set(requestId, resolve);

      const message: DevToolsMessage = {
        type: type as DevToolsMessage['type'],
        timestamp: Date.now(),
        data,
        requestId,
      };

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message);
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          resolve(null);
        }
      }, 10000);
    });
  }

  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  /**
   * Subscribe to incoming DevTools messages
   */
  public on<T = any>(type: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
    return () => {
      const arr = this.listeners.get(type)!;
      this.listeners.set(
        type,
        arr.filter((cb) => cb !== callback),
      );
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: DevToolsMessage): void {
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const resolve = this.pendingRequests.get(message.requestId)!;
      this.pendingRequests.delete(message.requestId);
      resolve(message.data);
    }

    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      typeListeners.forEach((cb) => cb(message.data));
    }

    // Dispatch to handlers
    switch (message.type) {
      case 'heartbeat':
        this.sendHeartbeat();
        break;
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (
      this.messageQueue.length > 0 &&
      this.ws?.readyState === WebSocket.OPEN
    ) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send periodic heartbeat
   */
  private sendHeartbeat(): void {
    this.send('heartbeat', {
      pid: typeof window !== 'undefined' ? 'browser' : 'ssr',
    });
    setTimeout(() => this.sendHeartbeat(), 30000);
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Close connection
   */
  public close(): void {
    this.ws?.close();
  }
}

// Singleton instance
let devToolsInstance: DevToolsClient | null = null;

export function getDevToolsClient(): DevToolsClient | null {
  if (typeof window === 'undefined') return null;

  if (!devToolsInstance) {
    devToolsInstance = new DevToolsClient();
  }

  return devToolsInstance;
}
