import { describe, it, expect } from 'bun:test';
import { ProductionSSREngine } from '../production.js';
import path from 'node:path';

describe('ProductionSSREngine Streaming', () => {
  it('should stream the response correctly', async () => {
    // 1. Point to the mock page we just created
    const mockPagePath = path.resolve(__dirname, './mock-page.js');
    
    // 2. Call the new stream streaming method
    const response = await ProductionSSREngine.renderPageStream(mockPagePath, 'en');
    
    // 3. Verify we get a Response object
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    
    // 4. Consume the stream
    const htmlText = await response.text();
    
    // 5. Verify contents
    expect(htmlText).toContain('<!DOCTYPE html>');
    expect(htmlText).toContain('<html lang="en">');
    expect(htmlText).toContain('<div id="mock-page">Hello Stream!</div>');
    expect(htmlText).toContain('<script type="module">');
  });
});
