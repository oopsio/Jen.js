export * from "preact";
export * from "preact/hooks";
export * from "preact/compat";

// Polyfill exports
if (typeof window !== "undefined") {
  window.__PREACT_BUNDLE__ = true;
}
