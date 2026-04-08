import { expect, test, describe, mock } from 'bun:test';
import { DevToolsClient, getDevToolsClient } from '../client.js';

// Mock the WebSocket API
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  onopen: any;
  onmessage: any;
  onerror: any;
  onclose: any;
  readyState = 1;
  send = mock();
  close = mock();
}

(globalThis as any).WebSocket = MockWebSocket;

describe('DevToolsClient', () => {
  test('should establish WebSocket connections correctly', () => {
    const client = new DevToolsClient('ws://localhost:9999');
    expect(client).toBeDefined();
    expect(client.isConnected()).toBe(true);
  });

  test('should implement robust subscribe/unsubscribe handler patterns correctly', () => {
    const client = new DevToolsClient('ws://localhost:9999');
    const onRouteCallback = mock();

    // Subscribe
    const unsubscribe = client.on('route-trace', onRouteCallback);

    // Simulate Server WebSocket sending a message
    const ws = (client as any).ws;
    ws.onmessage({
      data: JSON.stringify({ type: 'route-trace', data: { pathname: '/dashboard' } })
    });

    // Callback should fire
    expect(onRouteCallback).toHaveBeenCalledTimes(1);
    expect(onRouteCallback).toHaveBeenCalledWith({ pathname: '/dashboard' });

    // Unsubscribe
    unsubscribe();

    // Simulate Server WebSocket sending another message post-unsubscribe
    ws.onmessage({
      data: JSON.stringify({ type: 'route-trace', data: { pathname: '/login' } })
    });

    // Callback should not fire again
    expect(onRouteCallback).toHaveBeenCalledTimes(1);
  });

  test('should operate globally as a localized singleton', () => {
    const instanceA = getDevToolsClient();
    const instanceB = getDevToolsClient();
    
    expect(instanceA).toBe(instanceB);
  });
});
