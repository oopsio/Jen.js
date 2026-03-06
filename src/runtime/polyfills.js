/**
 * Core Polyfills for Browser Backwards Compatibility
 * Supports IE11, Edge Legacy, and older Chrome/Firefox/Safari versions
 *
 * Loaded early in <head> to ensure polyfills are available for all scripts
 */

(function () {
  "use strict";

  // ============================================================================
  // Promise polyfill (for IE11)
  // ============================================================================
  if (typeof Promise === "undefined") {
    window.Promise = function (executor) {
      var state = "pending";
      var handlers = [];
      var value;

      var resolve = function (val) {
        if (state !== "pending") return;
        value = val;
        state = "fulfilled";
        handlers.forEach(handle);
      };

      var reject = function (reason) {
        if (state !== "pending") return;
        value = reason;
        state = "rejected";
        handlers.forEach(handle);
      };

      var handle = function (handler) {
        setTimeout(function () {
          if (state === "fulfilled" && handler.onFulfilled) {
            try {
              handler.onFulfilled(value);
            } catch (e) {
              console.error("Promise rejection:", e);
            }
          }
          if (state === "rejected" && handler.onRejected) {
            try {
              handler.onRejected(value);
            } catch (e) {
              console.error("Promise rejection:", e);
            }
          }
        }, 0);
      };

      this.then = function (onFulfilled, onRejected) {
        return new Promise(function (resolve, reject) {
          handle({
            onFulfilled: function (value) {
              if (typeof onFulfilled !== "function") {
                resolve(value);
              } else {
                try {
                  resolve(onFulfilled(value));
                } catch (e) {
                  reject(e);
                }
              }
            },
            onRejected: function (reason) {
              if (typeof onRejected !== "function") {
                reject(reason);
              } else {
                try {
                  resolve(onRejected(reason));
                } catch (e) {
                  reject(e);
                }
              }
            },
          });
        });
      };

      this.catch = function (onRejected) {
        return this.then(undefined, onRejected);
      };

      try {
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    };

    window.Promise.all = function (promises) {
      return new Promise(function (resolve, reject) {
        var results = [];
        var completed = 0;
        promises.forEach(function (p, i) {
          p.then(function (result) {
            results[i] = result;
            completed++;
            if (completed === promises.length) {
              resolve(results);
            }
          }, reject);
        });
      });
    };

    window.Promise.resolve = function (value) {
      return new Promise(function (resolve) {
        resolve(value);
      });
    };

    window.Promise.reject = function (reason) {
      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    };
  }

  // ============================================================================
  // fetch polyfill (for IE11, older browsers)
  // ============================================================================
  if (typeof fetch === "undefined") {
    window.fetch = function (url, options) {
      options = options || {};

      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        var method = options.method || "GET";

        xhr.open(method, url, true);

        if (options.headers) {
          Object.keys(options.headers).forEach(function (key) {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }

        xhr.onload = function () {
          var contentType = xhr.getResponseHeader("content-type") || "";
          var responseText = xhr.responseText || "";
          var responseJson = {};

          try {
            responseJson = JSON.parse(responseText);
          } catch (e) {
            // Response is not JSON
          }

          resolve({
            status: xhr.status,
            statusText: xhr.statusText,
            ok: xhr.status >= 200 && xhr.status < 300,
            headers: {
              get: function (name) {
                return xhr.getResponseHeader(name);
              },
            },
            text: function () {
              return Promise.resolve(responseText);
            },
            json: function () {
              return Promise.resolve(responseJson);
            },
            blob: function () {
              return Promise.resolve(
                new Blob([responseText], { type: contentType }),
              );
            },
          });
        };

        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };

        xhr.ontimeout = function () {
          reject(new TypeError("Network request timeout"));
        };

        var body = options.body;
        if (body && typeof body === "object") {
          body = JSON.stringify(body);
          xhr.setRequestHeader("Content-Type", "application/json");
        }

        xhr.send(body || null);
      });
    };
  }

  // ============================================================================
  // Object.assign polyfill (for ES5)
  // ============================================================================
  if (typeof Object.assign === "undefined") {
    Object.defineProperty(Object, "assign", {
      value: function assign(target, source) {
        if (target === null || target === undefined) {
          throw new TypeError("Cannot convert undefined or null to object");
        }
        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var source = arguments[index];
          if (source !== null && source !== undefined) {
            for (var nextKey in source) {
              if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
                output[nextKey] = source[nextKey];
              }
            }
          }
        }
        return output;
      },
      writable: true,
      configurable: true,
    });
  }

  // ============================================================================
  // Array.prototype.find polyfill (for ES5)
  // ============================================================================
  if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
      if (this === null || this === undefined) {
        throw new TypeError("Array.prototype.find called on null or undefined");
      }
      if (typeof predicate !== "function") {
        throw new TypeError(predicate + " is not a function");
      }
      var list = Object(this);
      var length = parseInt(list.length, 10) || 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }

  // ============================================================================
  // Array.prototype.includes polyfill (for ES5)
  // ============================================================================
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
      value: function (searchElement, fromIndex) {
        if (this === null || this === undefined) {
          throw new TypeError('"this" is null or not defined');
        }

        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;

        if (len === 0) {
          return false;
        }

        var n = parseInt(fromIndex, 10) || 0;
        var k;

        if (n >= 0) {
          k = n;
        } else {
          k = len + n;
          if (k < 0) {
            k = 0;
          }
        }

        var searchLen = searchElement !== searchElement ? NaN : searchElement;
        while (k < len) {
          var elementK = O[k];
          if (
            elementK === searchLen ||
            (elementK !== elementK && searchLen !== searchLen)
          ) {
            return true;
          }
          k++;
        }
        return false;
      },
    });
  }

  // ============================================================================
  // String.prototype.startsWith polyfill (for ES5)
  // ============================================================================
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (search, pos) {
      return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    };
  }

  // ============================================================================
  // String.prototype.endsWith polyfill (for ES5)
  // ============================================================================
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (search, length) {
      if (length === undefined || length > this.length) {
        length = this.length;
      }
      return this.substring(length - search.length, length) === search;
    };
  }

  // ============================================================================
  // String.prototype.includes polyfill (for ES5)
  // ============================================================================
  if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
      "use strict";
      if (search instanceof RegExp) {
        throw TypeError("first argument must not be a RegExp");
      }
      if (start === undefined) {
        start = 0;
      }
      return this.indexOf(search, start) !== -1;
    };
  }

  // ============================================================================
  // IntersectionObserver polyfill (for older browsers, scrolling detection)
  // ============================================================================
  if (typeof IntersectionObserver === "undefined") {
    window.IntersectionObserver = function (callback) {
      this.callback = callback;
      this.observedElements = [];
    };

    IntersectionObserver.prototype.observe = function (element) {
      if (this.observedElements.indexOf(element) === -1) {
        this.observedElements.push(element);
      }
      var self = this;
      this._checkVisibility = function () {
        self.observedElements.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          var isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          self.callback([{ target: el, isIntersecting: isVisible }]);
        });
      };
      window.addEventListener("scroll", this._checkVisibility);
      window.addEventListener("resize", this._checkVisibility);
      this._checkVisibility();
    };

    IntersectionObserver.prototype.unobserve = function (element) {
      var idx = this.observedElements.indexOf(element);
      if (idx !== -1) {
        this.observedElements.splice(idx, 1);
      }
    };

    IntersectionObserver.prototype.disconnect = function () {
      if (this._checkVisibility) {
        window.removeEventListener("scroll", this._checkVisibility);
        window.removeEventListener("resize", this._checkVisibility);
      }
      this.observedElements = [];
    };
  }

  // ============================================================================
  // requestIdleCallback polyfill (for older browsers)
  // ============================================================================
  if (typeof requestIdleCallback === "undefined") {
    window.requestIdleCallback = function (callback) {
      var start = Date.now();
      return setTimeout(function () {
        callback({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1);
    };
  }

  if (typeof cancelIdleCallback === "undefined") {
    window.cancelIdleCallback = function (id) {
      clearTimeout(id);
    };
  }

  // ============================================================================
  // WeakMap polyfill (for ES5)
  // ============================================================================
  if (typeof WeakMap === "undefined") {
    window.WeakMap = function () {
      this._id = "__weakmap_" + Math.random().toString(36).slice(2);
    };
    WeakMap.prototype.set = function (key, value) {
      Object.defineProperty(key, this._id, { value: value, writable: true });
      return this;
    };
    WeakMap.prototype.get = function (key) {
      return key[this._id];
    };
    WeakMap.prototype.has = function (key) {
      return this._id in key;
    };
    WeakMap.prototype.delete = function (key) {
      return delete key[this._id];
    };
  }

  // ============================================================================
  // Symbol polyfill (for ES5)
  // ============================================================================
  if (typeof Symbol === "undefined") {
    var symbolCounter = 0;
    window.Symbol = function (description) {
      var sym = "__symbol_" + (description || "") + "_" + ++symbolCounter;
      return sym;
    };
    Symbol.iterator = Symbol("iterator");
  }

  // ============================================================================
  // console polyfill (for very old browsers)
  // ============================================================================
  if (typeof console === "undefined") {
    window.console = {
      log: function () {},
      warn: function () {},
      error: function () {},
      info: function () {},
      debug: function () {},
      trace: function () {},
      assert: function () {},
      clear: function () {},
    };
  }

  console.log("[Polyfills] Compatibility layer loaded for legacy browsers");
})();
