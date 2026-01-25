export function runtimeHydrateModule() {
  return `
import { hydrate } from "https://esm.sh/preact@10.25.4";
import { h } from "https://esm.sh/preact@10.25.4";

function getFrameworkData() {
  const el = document.getElementById("__FRAMEWORK_DATA__");
  if (!el) return null;
  try { return JSON.parse(el.textContent || "null"); } catch { return null; }
}

export async function hydrateClient(entryPath) {
  const data = getFrameworkData();
  const mod = await import(entryPath);
  const Page = mod.default;
  const app = h(Page, {
    data: data?.data ?? null,
    params: data?.params ?? {},
    query: data?.query ?? {}
  });
  const root = document.getElementById("app");
  if (!root) return;
  hydrate(app, root);
}
`;
}

export function buildHydrationModule(filePath: string) {
  // we import the actual route module via file:// in dev
  // for now, we use absolute path import which Node won't allow in browser
  // so we convert it to /__route?file=... later. For now we inline a stub.
  // Minimal working: no real hydration in prod yet, but runtime exists.
  return `
export default function Page(){ return null }
`;
}
