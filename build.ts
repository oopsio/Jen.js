import config from "./framework.config.ts";
import { buildSite } from "./src/build/build.js";

await buildSite({
  config
});
