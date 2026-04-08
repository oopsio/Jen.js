/**
 * Route match result with parameters and file paths
 */
export class RouteMatch {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RouteMatch.prototype);
        obj.__wbg_ptr = ptr;
        RouteMatchFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RouteMatchFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_routematch_free(ptr, 0);
    }
    /**
     * Gets the resolved `.jsx` file path, if any.
     * @returns {string}
     */
    get filePathJsx() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.routematch_filePathJsx(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Gets the resolved `.tsx` file path, if any.
     * @returns {string}
     */
    get filePathTsx() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.routematch_filePathTsx(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns true if the route was successfully matched.
     * @returns {boolean}
     */
    get found() {
        const ret = wasm.routematch_found(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Creates a new RouteMatch instance.
     *
     * # Arguments
     *
     * * `found` - Whether the route was matched successfully
     * * `pathname` - The matched pathname
     * * `params` - A JSON-encoded string of route parameters
     * * `file_path_tsx` - The path to the resolved `.tsx` file
     * * `file_path_jsx` - The path to the resolved `.jsx` file
     * @param {boolean} found
     * @param {string} pathname
     * @param {string} params
     * @param {string} file_path_tsx
     * @param {string} file_path_jsx
     */
    constructor(found, pathname, params, file_path_tsx, file_path_jsx) {
        const ptr0 = passStringToWasm0(pathname, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(params, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(file_path_tsx, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(file_path_jsx, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.routematch_new(found, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        this.__wbg_ptr = ret >>> 0;
        RouteMatchFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Gets the JSON string containing route parameters.
     * @returns {string}
     */
    get params() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.routematch_params(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Gets the normalized pathname that was matched.
     * @returns {string}
     */
    get pathname() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.routematch_pathname(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) RouteMatch.prototype[Symbol.dispose] = RouteMatch.prototype.free;

/**
 * High-performance route matcher for dynamic and static routes
 */
export class RouteMatcher {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RouteMatcherFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_routematcher_free(ptr, 0);
    }
    /**
     * Clear all routes
     */
    clear() {
        wasm.routematcher_clear(this.__wbg_ptr);
    }
    /**
     * Match a pathname against registered routes.
     *
     * First looks for exact static matches (O(1)), then falls back
     * to evaluating dynamic routes.
     *
     * # Arguments
     *
     * * `pathname` - The incoming URL pathname to match
     * @param {string} pathname
     * @returns {RouteMatch}
     */
    match_route(pathname) {
        const ptr0 = passStringToWasm0(pathname, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.routematcher_match_route(this.__wbg_ptr, ptr0, len0);
        return RouteMatch.__wrap(ret);
    }
    /**
     * Create a new route matcher
     */
    constructor() {
        const ret = wasm.routematcher_new();
        this.__wbg_ptr = ret >>> 0;
        RouteMatcherFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Register a route pattern.
     *
     * # Arguments
     *
     * * `path` - The route pattern (can contain dynamic segments like `:id`)
     * * `file_path_tsx` - The associated `.tsx` file path
     * * `file_path_jsx` - The associated `.jsx` file path
     * @param {string} path
     * @param {string} file_path_tsx
     * @param {string} file_path_jsx
     */
    register(path, file_path_tsx, file_path_jsx) {
        const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_path_tsx, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(file_path_jsx, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        wasm.routematcher_register(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
    }
    /**
     * Get count of registered routes
     * @returns {number}
     */
    route_count() {
        const ret = wasm.routematcher_route_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Set an optional base path to strip from incoming requests
     * @param {string} base_path
     */
    set_base_path(base_path) {
        const ptr0 = passStringToWasm0(base_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.routematcher_set_base_path(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) RouteMatcher.prototype[Symbol.dispose] = RouteMatcher.prototype.free;
export function __wbg___wbindgen_throw_6ddd609b62940d55(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const RouteMatchFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_routematch_free(ptr >>> 0, 1));
const RouteMatcherFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_routematcher_free(ptr >>> 0, 1));

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
