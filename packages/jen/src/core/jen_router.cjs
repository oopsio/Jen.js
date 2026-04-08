/* @ts-self-types="./jen_router.d.ts" */

import * as wasm from "./jen_router_bg.wasm";
import { __wbg_set_wasm } from "./jen_router_bg.cjs";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    RouteMatch, RouteMatcher
} from "./jen_router_bg.cjs";
