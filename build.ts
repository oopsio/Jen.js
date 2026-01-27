import config from "./jen.config.js";
import { buildSite } from "./src/build/build.js";

await buildSite({ config });
