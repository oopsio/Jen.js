/**
 * SSR/Hydration Mismatch Detector
 * Verifies server-rendered HTML matches client-side state
 */

import type { SSRMetrics, HydrationChecksum } from './types.js';

export class SSRHydrationDetector {
  /**
   * Generate checksum of DOM tree structure
   */
  public static generateChecksum(root: Element): string {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      null,
    );

    let html = '';
    let node: Element | null = root;

    while (node) {
      html += `<${node.tagName.toLowerCase()}`;

      // Include relevant attributes
      if (node.id) html += ` id="${node.id}"`;
      if (node.className) html += ` class="${node.className}"`;

      // Add text content (first 50 chars)
      const text = node.textContent
        ?.substring(0, 50)
        .replace(/\n/g, ' ')
        .trim();
      if (text && !node.children.length) {
        html += `>${text}</`;
      }

      html += `>${node.tagName.toLowerCase()}>`;

      node = walker.nextNode() as Element;
    }

    return this.simpleHash(html);
  }

  /**
   * Simple hash function for checksums
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Detect mismatches between server and client renders
   */
  public static detectMismatch(
    serverHtml: string,
    clientRoot: Element,
  ): HydrationChecksum {
    const serverChecksum = this.simpleHash(serverHtml);
    const clientChecksum = this.generateChecksum(clientRoot);

    const mismatches = this.findMismatches(serverHtml, clientRoot);

    return {
      serverChecksum,
      clientChecksum,
      nodeCount: clientRoot.querySelectorAll('*').length,
      mismatches,
    };
  }

  /**
   * Find specific DOM node mismatches
   */
  private static findMismatches(
    serverHtml: string,
    clientRoot: Element,
  ): Array<{
    path: string;
    serverValue: string;
    clientValue: string;
  }> {
    const mismatches = [];

    // Check element counts
    const serverElementCount = (serverHtml.match(/<[^/][^>]*>/g) || []).length;
    const clientElementCount = clientRoot.querySelectorAll('*').length;

    if (serverElementCount !== clientElementCount) {
      mismatches.push({
        path: 'root',
        serverValue: `${serverElementCount} elements`,
        clientValue: `${clientElementCount} elements`,
      });
    }

    // Check critical attributes
    clientRoot.querySelectorAll('[id]').forEach((el) => {
      const id = el.id;
      if (serverHtml.includes(`id="${id}"`)) {
        // OK
      } else {
        mismatches.push({
          path: `#${id}`,
          serverValue: 'missing id',
          clientValue: `id="${id}"`,
        });
      }
    });

    return mismatches.slice(0, 10); // Limit to first 10 mismatches
  }

  /**
   * Measure SSR performance and hydration success
   */
  public static measureSSR(
    renderTimeMs: number,
    componentCount: number,
    hydrationChecksum: HydrationChecksum | null,
  ): SSRMetrics {
    return {
      renderTime: renderTimeMs,
      componentCount,
      hydrationStatus: hydrationChecksum
        ? hydrationChecksum.mismatches.length === 0
          ? 'success'
          : 'mismatch'
        : 'pending',
      hydrationChecksum,
    };
  }

  /**
   * Flag performance issues
   */
  public static analyzePerformance(metrics: SSRMetrics): string[] {
    const issues: string[] = [];

    if (metrics.renderTime > 100) {
      issues.push(
        `[!] Slow SSR render: ${metrics.renderTime.toFixed(0)}ms (target: <50ms)`,
      );
    }

    if (metrics.componentCount > 500) {
      issues.push(
        `[!] High component count: ${metrics.componentCount} (consider chunking)`,
      );
    }

    if (
      metrics.hydrationChecksum &&
      metrics.hydrationChecksum.mismatches.length > 0
    ) {
      issues.push(
        `[-] Hydration mismatch: ${metrics.hydrationChecksum.mismatches.length} DOM differences`,
      );
    }

    return issues;
  }
}
