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
export declare function createIslandRegistry(): IslandRegistry;
/**
 * Mark a component as an island (placeholder implementation)
 * In a real framework, this would be a decorator or a HOC
 */
export declare function markIsland(name: string, props: any): string;
/**
 * Extract islands from HTML string
 */
export declare function extractIslandsFromHtml(html: string): Island[];
/**
 * Inject hydration script into HTML
 */
export declare function injectIslandScript(html: string, islands: Island[]): string;
