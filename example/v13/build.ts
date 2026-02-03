import config from "./jen.config.js";
import { buildSite } from "../../src/build/production-build.js";

await buildSite({ config });
