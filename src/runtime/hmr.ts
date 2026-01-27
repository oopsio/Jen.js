// Client-side Hot Module Replacement (HMR) / Live Reload
// Injected into the browser during development

export const HMR_CLIENT_SCRIPT = `
(function() {
  console.log("[Jen.js] Connecting to HMR...");
  const evt = new EventSource("/__hmr");

  evt.onopen = () => console.log("[Jen.js] HMR Connected");

  evt.addEventListener("reload", () => {
    console.log("[Jen.js] Reloading...");
    window.location.reload();
  });

  evt.addEventListener("style-update", (e) => {
    const file = JSON.parse(e.data).file; // e.g., "styles.css"
    console.log("[Jen.js] Style update:", file);
    
    // Find matching link tags
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
      const url = new URL(link.href);
      if (url.pathname.endsWith(file)) {
        // Force reload by updating query param
        url.searchParams.set("t", Date.now());
        link.href = url.toString();
        console.log("[Jen.js] Updated stylesheet:", file);
      }
    }
  });

  evt.onerror = () => {
    // console.log("[Jen.js] HMR disconnected, retrying...");
    // EventSource automatically retries
  };
})();
`;
