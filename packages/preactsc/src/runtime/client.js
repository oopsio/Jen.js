export function generateClientBootloader() {
  return `
// PRSC Client Bootloader
(function() {
  const manifestEl = document.getElementById('__PRSC_DATA__');
  if (!manifestEl) return;

  let manifest;
  try {
    manifest = JSON.parse(manifestEl.textContent);
  } catch (err) {
    console.error('Failed to parse PRSC manifest:', err);
    return;
  }

  // Security: Validate manifest is an array
  if (!Array.isArray(manifest)) {
    console.error('Invalid manifest format');
    return;
  }
  
  async function hydrateClients() {
    for (const component of manifest) {
      // Security: Validate component data
      if (!component.id || typeof component.id !== 'string') {
        console.error('Invalid component id');
        continue;
      }

      if (!component.path || typeof component.path !== 'string' || !component.path.startsWith('.')) {
        console.error('Invalid component path:', component.path);
        continue;
      }

      const placeholder = document.querySelector(\`[data-prsc-id="\${CSS.escape(component.id)}"]\`);
      if (!placeholder) continue;

      try {
        // Security: Validate path before import
        if (!/^\.\\/([-a-zA-Z0-9_/.]+)$/.test(component.path)) {
          throw new Error('Invalid component path');
        }

        // Load component module dynamically
        const mod = await import(component.path);
        const Component = mod.default || mod[component.name] || mod;
        
        if (typeof Component !== 'function') {
          throw new Error('Invalid component export');
        }

        // Render/hydrate the component
        if (window.preact) {
          const { render, createElement: h } = window.preact;
          if (render && h) {
            render(
              h(Component, component.props || {}),
              placeholder
            );
          }
        }
      } catch (err) {
        console.error(\`Failed to hydrate component \${component.id}:\`, err.message);
        placeholder.innerHTML = '<div style="color: red;">Error loading component</div>';
      }
    }
  }

  // Wait for preact to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateClients);
  } else {
    hydrateClients();
  }
})();
`;
}

export function generateClientEntry(manifestData) {
  return `
import { render } from "preact";
import { createElement as h } from "preact";

const manifest = ${JSON.stringify(manifestData, null, 2)};

async function hydrateApp() {
  for (const component of manifest) {
    const el = document.querySelector(\`[data-prsc-id="\${component.id}"]\`);
    if (!el) continue;

    try {
      const mod = await import(component.path);
      const Component = mod.default || mod;
      
      render(h(Component, component.props), el);
    } catch (err) {
      console.error(\`Error hydrating component \${component.id}:\`, err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrateApp);
} else {
  hydrateApp();
}
`;
}
