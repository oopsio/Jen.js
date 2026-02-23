/**
 * Initialize island hydration when DOM is ready.
 * Waits for DOMContentLoaded if the page is still loading, otherwise starts immediately.
 * This ensures island DOM elements exist before hydration attempts.
 *
 * Called automatically on module import.
 */
export declare function initializeIslands(): void;
