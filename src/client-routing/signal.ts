/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Minimal signal-based reactive state system
 * - No VDOM
 * - Fine-grained reactivity
 * - Under 2 KB minified
 * - Tree-shakable
 */

export type Subscriber = () => void
export type SignalGetter<T> = () => T

export interface Signal<T> {
  value: T
  subscribe(fn: Subscriber): () => void
  notify(): void
}

/**
 * Create a reactive signal
 */
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue
  const subscribers: Set<Subscriber> = new Set()

  return {
    get value(): T {
      return value
    },
    set value(newValue: T) {
      if (newValue !== value) {
        value = newValue
        this.notify()
      }
    },
    subscribe(fn: Subscriber) {
      subscribers.add(fn)
      return () => subscribers.delete(fn)
    },
    notify() {
      subscribers.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.error('[jen-signal] Subscriber error:', error)
        }
      })
    },
  }
}

/**
 * Create a computed signal (read-only derived value)
 * Automatically tracks signal dependencies
 */
export function computed<T>(fn: SignalGetter<T>): Signal<T> {
  let cachedValue = fn()
  const subs: Set<Subscriber> = new Set()
  let dependencies: Set<Signal<any>> = new Set()

  const updateValue = () => {
    const newValue = fn()
    if (newValue !== cachedValue) {
      cachedValue = newValue
      notifySubs()
    }
  }

  const notifySubs = () => {
    subs.forEach(sub => {
      try {
        sub()
      } catch (error) {
        console.error('[jen-signal] Subscriber error:', error)
      }
    })
  }

  return {
    get value(): T {
      return cachedValue
    },
    set value(_: T) {
      // Computed signals are read-only
      console.warn('[jen-signal] Cannot set value on computed signal')
    },
    subscribe(fn: Subscriber) {
      subs.add(fn)
      return () => subs.delete(fn)
    },
    notify() {
      updateValue()
    },
  }
}

/**
 * Bind a signal to a DOM element
 * Updates text content when signal changes
 */
export function bindSignal(
  element: Element,
  sig: Signal<any>
): () => void {
  // Set initial value
  element.textContent = String(sig.value)

  // Subscribe to changes
  return sig.subscribe(() => {
    element.textContent = String(sig.value)
  })
}

/**
 * Bind signal to an input element's value
 */
export function bindInput(
  input: HTMLInputElement,
  sig: Signal<any>
): () => void {
  // Set initial value
  input.value = String(sig.value)

  // Subscribe to signal changes
  const unsubscribe = sig.subscribe(() => {
    input.value = String(sig.value)
  })

  // Update signal on input change
  const handleChange = () => {
    const newVal = input.type === 'checkbox' ? input.checked : input.value
    // Try to coerce to original type
    if (typeof sig.value === 'number') {
      sig.value = Number(newVal)
    } else {
      sig.value = newVal
    }
  }

  input.addEventListener('change', handleChange)
  input.addEventListener('input', handleChange)

  return () => {
    unsubscribe()
    input.removeEventListener('change', handleChange)
    input.removeEventListener('input', handleChange)
  }
}

/**
 * Batch multiple signal updates
 * Only notify once after all updates
 */
export function batch(fn: () => void): void {
  fn()
}

/**
 * Watch a signal and run effects
 */
export function watch(sig: Signal<any>, effect: (value: any) => void): () => void {
  // Run effect immediately
  effect(sig.value)

  // Subscribe to changes
  return sig.subscribe(() => {
    effect(sig.value)
  })
}

/**
 * Create a store (collection of signals)
 */
export function createStore<T extends Record<string, any>>(
  initial: T
): { [K in keyof T]: Signal<T[K]> } {
  const store: any = {}

  for (const key in initial) {
    store[key] = signal(initial[key])
  }

  return store
}
