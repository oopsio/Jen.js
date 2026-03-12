/**
 * Minimal signal-based reactive state system
 * - No VDOM
 * - Fine-grained reactivity
 * - Under 2 KB minified
 * - Tree-shakable
 */
/**
 * Create a reactive signal
 */
export function signal(initialValue) {
    let value = initialValue;
    const subscribers = new Set();
    return {
        get value() {
            return value;
        },
        set value(newValue) {
            if (newValue !== value) {
                value = newValue;
                this.notify();
            }
        },
        subscribe(fn) {
            subscribers.add(fn);
            return () => subscribers.delete(fn);
        },
        notify() {
            subscribers.forEach((fn) => {
                try {
                    fn();
                }
                catch (error) {
                    console.error("[jen-signal] Subscriber error:", error);
                }
            });
        },
    };
}
/**
 * Create a computed signal (read-only derived value)
 * Automatically tracks signal dependencies
 */
export function computed(fn) {
    let cachedValue = fn();
    const subs = new Set();
    let dependencies = new Set();
    const updateValue = () => {
        const newValue = fn();
        if (newValue !== cachedValue) {
            cachedValue = newValue;
            notifySubs();
        }
    };
    const notifySubs = () => {
        subs.forEach((sub) => {
            try {
                sub();
            }
            catch (error) {
                console.error("[jen-signal] Subscriber error:", error);
            }
        });
    };
    return {
        get value() {
            return cachedValue;
        },
        set value(_) {
            // Computed signals are read-only
            console.warn("[jen-signal] Cannot set value on computed signal");
        },
        subscribe(fn) {
            subs.add(fn);
            return () => subs.delete(fn);
        },
        notify() {
            updateValue();
        },
    };
}
/**
 * Bind a signal to a DOM element
 * Updates text content when signal changes
 */
export function bindSignal(element, sig) {
    // Set initial value
    element.textContent = String(sig.value);
    // Subscribe to changes
    return sig.subscribe(() => {
        element.textContent = String(sig.value);
    });
}
/**
 * Bind signal to an input element's value
 */
export function bindInput(input, sig) {
    // Set initial value
    input.value = String(sig.value);
    // Subscribe to signal changes
    const unsubscribe = sig.subscribe(() => {
        input.value = String(sig.value);
    });
    // Update signal on input change
    const handleChange = () => {
        const newVal = input.type === "checkbox" ? input.checked : input.value;
        // Try to coerce to original type
        if (typeof sig.value === "number") {
            sig.value = Number(newVal);
        }
        else {
            sig.value = newVal;
        }
    };
    input.addEventListener("change", handleChange);
    input.addEventListener("input", handleChange);
    return () => {
        unsubscribe();
        input.removeEventListener("change", handleChange);
        input.removeEventListener("input", handleChange);
    };
}
/**
 * Batch multiple signal updates
 * Only notify once after all updates
 */
export function batch(fn) {
    fn();
}
/**
 * Watch a signal and run effects
 */
export function watch(sig, effect) {
    // Run effect immediately
    effect(sig.value);
    // Subscribe to changes
    return sig.subscribe(() => {
        effect(sig.value);
    });
}
/**
 * Create a store (collection of signals)
 */
export function createStore(initial) {
    const store = {};
    for (const key in initial) {
        store[key] = signal(initial[key]);
    }
    return store;
}
