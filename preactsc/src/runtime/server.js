/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { render } from "preact-render-to-string";
import { createElement as h } from "preact";

const clientComponentMap = new Map();
let nextClientId = 0;

// Security: Validate component path before rendering
function validateComponentPath(path) {
  if (typeof path !== "string") return false;
  // Only allow relative paths
  return path.startsWith(".");
}

export async function renderApp(App, props = {}) {
  // Security: Validate App
  if (typeof App !== "function") {
    throw new Error("App must be a function component");
  }

  // Security: Validate props is an object
  if (props && typeof props !== "object") {
    throw new Error("Props must be an object");
  }

  clientComponentMap.clear();
  nextClientId = 0;

  // Render the app tree
  const html = await renderComponentTree(h(App, props || {}));

  return {
    html,
    manifest: Array.from(clientComponentMap.values()),
  };
}

async function renderComponentTree(vnode) {
  if (!vnode) return "";

  // Check if this is a client component (will have a special marker)
  if (vnode.type && vnode.type.__isClientComponent) {
    // Security: Validate client component metadata
    if (!validateComponentPath(vnode.type.__clientPath)) {
      console.error(
        `Invalid client component path: ${vnode.type.__clientPath}`,
      );
      return '<div style="color: red;">Invalid component configuration</div>';
    }

    const id = nextClientId++;

    // Security: Limit component ID count to prevent DoS
    if (id > 10000) {
      console.error("Too many client components");
      return '<div style="color: red;">Too many components</div>';
    }

    clientComponentMap.set(id, {
      id: `client-${id}`,
      path: vnode.type.__clientPath,
      props: vnode.props || {},
    });
    return `<div data-prsc-id="client-${id}"></div>`;
  }

  // Render server components normally
  try {
    return await render(vnode);
  } catch (err) {
    console.error("Error rendering component:", err);
    // Security: Don't expose error details in HTML
    return '<div style="color: red;">Component render error</div>';
  }
}

export function markClientComponent(Component, clientPath) {
  // Security: Validate client path
  if (!validateComponentPath(clientPath)) {
    throw new Error(`Invalid client component path: ${clientPath}`);
  }

  if (typeof Component !== "function") {
    throw new Error("Component must be a function");
  }

  Component.__isClientComponent = true;
  Component.__clientPath = clientPath;
  return Component;
}
