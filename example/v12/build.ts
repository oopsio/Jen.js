import { buildSite } from "../../src/build/build";
import config from "./jen.config";

buildSite({ config }).catch(console.error);
