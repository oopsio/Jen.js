export interface Island {
  id: string;
  component: string;
  props: any;
}

export interface IslandRegistry {
  islands: Island[];
}

/**
 * Creates an empty island registry for a request
 */
export function createIslandRegistry(): IslandRegistry {
  return { islands: [] };
}

/**
 * Mark a component as an island (placeholder implementation)
 * In a real framework, this would be a decorator or a HOC
 */
export function markIsland(name: string, props: any): string {
  const id = `island-${Math.random().toString(36).slice(2, 9)}`;
  return `<div data-island="${name}" data-props='${JSON.stringify(props)}' id="${id}"></div>`;
}

/**
 * Extract islands from HTML string
 */
export function extractIslandsFromHtml(html: string): Island[] {
  const islands: Island[] = [];
  const regex = /data-island="([^"]+)" data-props='([^']+)' id="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    islands.push({
      component: match[1],
      props: JSON.parse(match[2]),
      id: match[3]
    });
  }
  
  return islands;
}

/**
 * Inject hydration script into HTML
 */
export function injectIslandScript(html: string, islands: Island[]): string {
  if (islands.length === 0) return html;
  
  const script = `
    <script type="module">
      import { hydrate } from '/__runtime/hydrate.js';
      const islands = ${JSON.stringify(islands)};
      islands.forEach(i => hydrate(i.component, i.id, i.props));
    </script>
  `;
  
  return html.replace('</body>', `${script}</body>`);
}
