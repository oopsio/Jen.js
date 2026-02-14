import { hydrate } from "preact";
import { h } from "preact";
import { getFrameworkData } from "./client-runtime.js";

export async function hydrateClient(entryPath: string) {
  try {
    const data = getFrameworkData();
    const mod = await import(entryPath);

    if (!mod.default) {
      console.error(`Failed to hydrate: route module does not export default component`);
      return;
    }

    const Page = mod.default;
    const app = h(Page, {
      data: data?.data ?? null,
      params: data?.params ?? {},
      query: data?.query ?? {},
    });

    const root = document.getElementById("app");
    if (!root) {
      console.error("Failed to hydrate: #app element not found in DOM");
      return;
    }

    hydrate(app, root);
  } catch (err) {
    console.error("Hydration failed:", err instanceof Error ? err.message : String(err));
  }
}
