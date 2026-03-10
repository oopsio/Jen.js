/**
 * Retrieve framework data injected by the server into the page HTML.
 * The server embeds loader result data, route params, and query parameters
 * into a hidden DOM element with id "__FRAMEWORK_DATA__" as JSON.
 *
 * This data is passed to page components during hydration as props.
 * Returns null if the element does not exist or JSON is malformed,
 * allowing graceful degradation without throwing errors.
 *
 * Usage:
 *   const data = getFrameworkData();
 *   // data = { data: {...}, params: {...}, query: {...} }
 *
 * @returns Framework data object { data, params, query } or null if not found.
 */
export function getFrameworkData() {
  const el = document.getElementById("__FRAMEWORK_DATA__");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent || "null");
  } catch {
    // Silently return null if JSON is invalid; page hydrates with default props
    return null;
  }
}
