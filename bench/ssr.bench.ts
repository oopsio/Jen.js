/**
 * Jen.js Server-Side Rendering Performance Benchmarks
 * Measures SSR, hydration, and streaming performance
 */

import { describe, bench } from 'vitest';

// Simple Preact-like component for benchmarking
interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children?: VNode[];
}

class Component {
  render(props: Record<string, any>): VNode {
    return {
      type: 'div',
      props: { class: 'component' },
      children: [],
    };
  }
}

function createVNode(
  type: string | Function,
  props: Record<string, any>,
  ...children: VNode[]
): VNode {
  return { type, props, children };
}

function renderToString(vnode: VNode): string {
  if (typeof vnode.type === 'string') {
    const children = (vnode.children || []).map(renderToString).join('');
    const propsStr = Object.entries(vnode.props || {})
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    return `<${vnode.type} ${propsStr}>${children}</${vnode.type}>`;
  }
  return '';
}

describe('Server-Side Rendering (SSR)', () => {
  bench('Render Simple Component', () => {
    const vnode = createVNode('div', { class: 'app' }, createVNode('h1', {}, createVNode('span', {}, createVNode('text', {}))));

    return renderToString(vnode).length;
  });

  bench('Render Complex Component Tree - 100 Nodes', () => {
    let tree = createVNode('div', { id: 'root' });

    for (let i = 0; i < 100; i++) {
      tree = createVNode('div', { key: i }, tree);
    }

    return renderToString(tree).length;
  });

  bench('Render List - 1000 Items', () => {
    const items = Array(1000)
      .fill(null)
      .map((_, i) =>
        createVNode('li', { key: i }, createVNode('span', { class: 'item' }))
      );

    const list = createVNode('ul', {}, ...items);
    return renderToString(list).length;
  });

  bench('Render with Props - 500 Components', () => {
    const components = Array(500)
      .fill(null)
      .map((_, i) =>
        createVNode('Component', {
          id: i,
          name: `Component ${i}`,
          active: i % 2 === 0,
          data: { value: Math.random() },
        })
      );

    const html = components.map((c) => renderToString(c)).join('');
    return html.length;
  });

  bench('Render Conditional Content', () => {
    const items = Array(100)
      .fill(null)
      .map((_, i) => {
        const shouldShow = i % 2 === 0;
        return createVNode('div', { hidden: !shouldShow });
      });

    return items.filter((item) => !item.props.hidden).length;
  });

  bench('HTML Escaping - String Content', () => {
    const dangerousContent = '<script>alert("xss")</script>';
    const escaped = dangerousContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escaped.length;
  });

  bench('Hydration Markers - 1000 Components', () => {
    const markers = Array(1000)
      .fill(null)
      .map((_, i) => ({
        id: `__h${i}`,
        path: [0, i],
        props: { count: i },
      }));

    return JSON.stringify(markers).length;
  });

  bench('Streaming Response - Chunk Generation', () => {
    const chunkSize = 8192;
    const html = '<html>'.concat('div'.repeat(1000));
    const chunks = [];

    for (let i = 0; i < html.length; i += chunkSize) {
      chunks.push(html.slice(i, i + chunkSize));
    }

    return chunks.length;
  });

  bench('Response Compression - HTML Content', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page</title>
          <meta charset="utf-8">
          <style>body { margin: 0; padding: 0; }</style>
        </head>
        <body>
          <div id="app">${'<div class="item">Item</div>'.repeat(100)}</div>
          <script src="/bundle.js"></script>
        </body>
      </html>
    `.repeat(10);

    // Simulate gzip compression ratio
    const compressed = Math.floor(html.length * 0.25);
    return compressed;
  });

  bench('Inline Styles vs CSS Classes - 500 Elements', () => {
    const inlineStyle = Array(500)
      .fill(null)
      .map(
        (_, i) =>
          `<div style="color: red; padding: 10px; margin: 5px;">${i}</div>`
      )
      .join('');

    return inlineStyle.length;
  });

  bench('Script Injection - Hydration Data', () => {
    const hydrationData = {
      __PREACT_STATE__: {
        components: Array(100)
          .fill(null)
          .map((_, i) => ({
            id: i,
            state: { value: Math.random() },
          })),
      },
    };

    const scriptTag = `<script>window.__PREACT_STATE__ = ${JSON.stringify(hydrationData)}</script>`;
    return scriptTag.length;
  });

  bench('Meta Tags Generation', () => {
    const metaTags = [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta name="description" content="Page description">',
      '<meta property="og:title" content="Title">',
      '<meta property="og:image" content="/image.png">',
      '<link rel="canonical" href="https://example.com">',
      '<link rel="icon" href="/favicon.ico">',
      '<link rel="stylesheet" href="/styles.css">',
    ];

    return metaTags.join('\n').length;
  });

  bench('Head Injection - Open Graph', () => {
    const ogData = {
      title: 'Article Title',
      description: 'Article description',
      image: 'https://example.com/image.png',
      url: 'https://example.com/article',
      type: 'article',
    };

    const tags = Object.entries(ogData)
      .map(([key, value]) => `<meta property="og:${key}" content="${value}">`)
      .join('\n');

    return tags.length;
  });

  bench('Lazy Loading Markers - 500 Components', () => {
    const markers = Array(500)
      .fill(null)
      .map((_, i) => ({
        id: `lazy-${i}`,
        component: `LazyComponent${i}`,
        priority: i < 5 ? 'high' : 'low',
      }));

    return JSON.stringify(markers).length;
  });

  bench('Template String Interpolation - 100 Variables', () => {
    const vars = Object.fromEntries(
      Array(100)
        .fill(null)
        .map((_, i) => [`var${i}`, `value${i}`])
    );

    let template = 'Template: ';
    for (const [key, value] of Object.entries(vars)) {
      template += `${key}=${value} `;
    }

    return template.length;
  });

  bench('Fragment Rendering - 1000 Fragments', () => {
    const fragments = Array(1000)
      .fill(null)
      .map((_, i) => `<fragment-${i}></fragment-${i}>`);

    return fragments.join('').length;
  });

  bench('Error Boundary Rendering', () => {
    const errorHtml = `
      <div class="error-boundary">
        <h1>Something went wrong</h1>
        <p>Error message here</p>
        <button onclick="location.reload()">Try again</button>
      </div>
    `;

    return errorHtml.length;
  });

  bench('Static Asset Preloading - 50 Assets', () => {
    const assets = Array(50)
      .fill(null)
      .map((_, i) => `<link rel="preload" href="/asset-${i}.js" as="script">`);

    return assets.join('\n').length;
  });
});
