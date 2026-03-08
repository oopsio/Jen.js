// Type declarations for local lib/ folder (bundled Jen.js framework)
declare module "lib" {
  export * from "./lib/index.js";
}

declare module "lib/core" {
  export * from "./lib/core/config.js";
  export * from "./lib/core/routes/scan.js";
  export * from "./lib/core/routes/match.js";
  export * from "./lib/core/middleware-hooks.js";
  export * from "./lib/core/http.js";
}

declare module "lib/runtime" {
  export * from "./lib/runtime/render.js";
  export * from "./lib/runtime/islands.js";
}

declare module "lib/server" {
  export * from "./lib/server/app.js";
  export * from "./lib/server/ssr.js";
}
