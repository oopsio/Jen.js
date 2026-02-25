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

/**
 * Minimal client-side router for Jen.js
 * - Zero runtime cost if not used
 * - < 2 KB minified
 * - History API only
 * - Partial page updates via #app
 */

export interface RouteChangeEvent {
  path: string
  previousPath?: string
}

export type RouteChangeListener = (event: RouteChangeEvent) => void

let currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
const listeners: RouteChangeListener[] = []
let isNavigating = false

/**
 * Get the current route path
 */
export function getCurrentRoute(): string {
  return currentPath
}

/**
 * Navigate to a new route
 * @param path The path to navigate to
 * @param opts Navigation options
 */
export async function navigate(
  path: string,
  opts?: { replace?: boolean; scroll?: boolean }
): Promise<void> {
  if (isNavigating || path === currentPath) return

  isNavigating = true
  try {
    const previousPath = currentPath
    currentPath = path

    // Update browser history
    if (opts?.replace) {
      window.history.replaceState({ path }, '', path)
    } else {
      window.history.pushState({ path }, '', path)
    }

    // Handle scroll restoration
    if (opts?.scroll !== false) {
      window.scrollTo(0, 0)
    }

    // Fetch and update page content
    await updatePageContent(path)

    // Notify listeners
    notifyListeners({ path, previousPath })
  } finally {
    isNavigating = false
  }
}

/**
 * Subscribe to route changes
 */
export function onRouteChange(listener: RouteChangeListener): () => void {
  listeners.push(listener)
  return () => {
    const idx = listeners.indexOf(listener)
    if (idx > -1) listeners.splice(idx, 1)
  }
}

/**
 * Fetch and replace #app content
 */
async function updatePageContent(path: string): Promise<void> {
  try {
    // Try to fetch JSON payload first (faster)
    const jsonResponse = await fetch(`${path}?_json=1`, {
      headers: { 'X-Jen-Router': '1' },
    })

    if (jsonResponse.ok) {
      const data = await jsonResponse.json()
      updateDOM(data.html || data.content)
      return
    }

    // Fall back to HTML fetch
    const htmlResponse = await fetch(path, {
      headers: { 'X-Jen-Router': '1' },
    })

    if (!htmlResponse.ok) {
      if (htmlResponse.status === 404) {
        show404()
      }
      return
    }

    const html = await htmlResponse.text()
    // Extract #app content from response
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const newContent = doc.querySelector('#app')?.innerHTML
    if (newContent) {
      updateDOM(newContent)
    }
  } catch (error) {
    console.error('[jen-router] Navigation failed:', error)
  }
}

/**
 * Update #app innerHTML and re-run hydration hooks
 */
function updateDOM(html: string): void {
  const appEl = document.querySelector('#app')
  if (!appEl) return

  appEl.innerHTML = html

  // Re-run minimal hydration if available
  if (typeof window !== 'undefined' && (window as any).__JEN_HYDRATE__) {
    ;(window as any).__JEN_HYDRATE__()
  }
}

/**
 * Show 404 page
 */
function show404(): void {
  const appEl = document.querySelector('#app')
  if (appEl) {
    appEl.innerHTML = '<div class="jen-404"><h1>404 - Page Not Found</h1></div>'
  }
}

/**
 * Notify all listeners of route change
 */
function notifyListeners(event: RouteChangeEvent): void {
  listeners.forEach(listener => {
    try {
      listener(event)
    } catch (error) {
      console.error('[jen-router] Listener error:', error)
    }
  })
}

/**
 * Initialize router
 * - Set up popstate listener
 * - Auto-intercept internal links
 */
export function initRouter(): void {
  if (typeof window === 'undefined') return

  // Handle back/forward
  window.addEventListener('popstate', event => {
    const path = event.state?.path || window.location.pathname
    currentPath = path
    updatePageContent(path).then(() => {
      notifyListeners({ path })
    })
  })

  // Auto-intercept internal links
  document.addEventListener('click', event => {
    const target = (event.target as Element).closest('[data-jen-link]')
    if (!target) return

    const href = target.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('//')) return

    event.preventDefault()
    navigate(href)
  })
}
