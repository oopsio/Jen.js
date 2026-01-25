import { hydrate } from "preact";
import { h } from "preact";
import { getFrameworkData } from "./client-runtime.js";

export async function hydrateClient(entryPath: string) {
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
