export function matchRoute(routes, pathname) {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = pathname.match(re);
    if (!m) continue;
    const params = {};
    for (let i = 0; i < r.paramNames.length; i++) {
      params[r.paramNames[i]] = decodeURIComponent(m[i + 1] ?? "");
    }
    return { route: r, params };
  }
  return null;
}
