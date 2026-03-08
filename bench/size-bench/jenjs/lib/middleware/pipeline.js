export class Pipeline {
  static compose(middleware) {
    if (!Array.isArray(middleware))
      throw new TypeError("Middleware stack must be an array!");
    const handlers = middleware.map((mw) => this.resolveMiddleware(mw));
    return function (context, next) {
      let index = -1;
      function dispatch(i) {
        if (i <= index)
          return Promise.reject(new Error("next() called multiple times"));
        index = i;
        let fn = handlers[i];
        if (i === handlers.length) {
          fn = next;
        }
        if (!fn) return Promise.resolve();
        try {
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      }
      return dispatch(0);
    };
  }
  static resolveMiddleware(mw) {
    if (typeof mw === "function") {
      // Check if it's a class constructor (has prototype.handle)
      if (
        "prototype" in mw &&
        mw.prototype &&
        typeof mw.prototype.handle === "function"
      ) {
        try {
          const instance = new mw();
          return instance.handle.bind(instance);
        } catch (e) {
          // If instantiation fails, assume it's a simple function middleware
          return mw;
        }
      }
      return mw;
    }
    if (typeof mw === "object" && mw !== null && "handle" in mw) {
      return mw.handle.bind(mw);
    }
    throw new TypeError(
      "Middleware must be a function, a class constructor, or an object with a handle() method",
    );
  }
}
