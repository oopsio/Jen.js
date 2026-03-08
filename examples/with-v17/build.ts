import config from "./jen.config.ts";
import { buildSite } from "../../src/build/build.ts";

await buildSite({ config });
