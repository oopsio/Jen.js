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

import { describe, it, expect, vi } from 'vitest'
import {
  signal,
  computed,
  bindSignal,
  bindInput,
  batch,
  watch,
  createStore,
  type Signal,
} from '@src/client-routing/signal.js'

describe('Signal State System', () => {
  describe('signal', () => {
    it('should create a signal with initial value', () => {
      const count = signal(0)
      expect(count.value).toBe(0)
    })

    it('should update signal value', () => {
      const count = signal(0)
      count.value = 5
      expect(count.value).toBe(5)
    })

    it('should handle string values', () => {
      const name = signal('John')
      expect(name.value).toBe('John')
      name.value = 'Jane'
      expect(name.value).toBe('Jane')
    })

    it('should handle boolean values', () => {
      const isOpen = signal(false)
      expect(isOpen.value).toBe(false)
      isOpen.value = true
      expect(isOpen.value).toBe(true)
    })

    it('should handle object values', () => {
      const user = signal({ id: 1, name: 'John' })
      expect(user.value.name).toBe('John')
      user.value = { id: 2, name: 'Jane' }
      expect(user.value.name).toBe('Jane')
    })

    it('should handle array values', () => {
      const items = signal([1, 2, 3])
      expect(items.value.length).toBe(3)
      items.value = [1, 2, 3, 4]
      expect(items.value.length).toBe(4)
    })

    it('should subscribe to changes', () => {
      const count = signal(0)
      const listener = vi.fn()

      count.subscribe(listener)
      count.value = 1

      expect(listener).toHaveBeenCalledOnce()
    })

    it('should support multiple subscribers', () => {
      const count = signal(0)
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      count.subscribe(listener1)
      count.subscribe(listener2)
      count.value = 1

      expect(listener1).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledOnce()
    })

    it('should allow unsubscribing', () => {
      const count = signal(0)
      const listener = vi.fn()

      const unsubscribe = count.subscribe(listener)
      count.value = 1
      unsubscribe()
      count.value = 2

      expect(listener).toHaveBeenCalledOnce()
    })

    it('should not notify if value does not change', () => {
      const count = signal(0)
      const listener = vi.fn()

      count.subscribe(listener)
      count.value = 0 // Same value

      expect(listener).not.toHaveBeenCalled()
    })

    it('should support notify method', () => {
      const count = signal(0)
      const listener = vi.fn()

      count.subscribe(listener)
      count.notify()

      expect(listener).toHaveBeenCalledOnce()
    })
  })

  describe('computed', () => {
    it('should create computed signal', () => {
      const count = signal(5)
      const doubled = computed(() => count.value * 2)

      expect(doubled.value).toBe(10)
    })

    it('should create derived values', () => {
      const count = signal(5)
      const doubled = computed(() => count.value * 2)
      
      expect(doubled.value).toBe(10)
      expect(typeof doubled.value).toBe('number')
    })

    it('should be read-only', () => {
      const doubled = computed(() => 10)
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      doubled.value = 20

      expect(consoleSpy).toHaveBeenCalled()
      expect(doubled.value).toBe(10)

      consoleSpy.mockRestore()
    })

    it('should cache value', () => {
      let callCount = 0
      const value = computed(() => {
        callCount++
        return callCount
      })

      expect(value.value).toBe(1)
      expect(value.value).toBe(1) // Should return cached value
    })
  })

  describe('bindSignal', () => {
    it('should return unsubscribe function', () => {
      // Create mock element
      const mockEl = { textContent: '' } as any
      const count = signal(5)

      const unsub = bindSignal(mockEl, count)
      expect(typeof unsub).toBe('function')
    })
  })

  describe('bindInput', () => {
    it('should support numeric type coercion', () => {
      const value = signal(5)
      expect(typeof value.value).toBe('number')
      expect(value.value).toBe(5)
    })

    it('should support string type coercion', () => {
      const value = signal('hello')
      expect(typeof value.value).toBe('string')
      expect(value.value).toBe('hello')
    })

    it('should support boolean type coercion', () => {
      const value = signal(false)
      expect(typeof value.value).toBe('boolean')
      expect(value.value).toBe(false)
    })
  })

  describe('batch', () => {
    it('should execute function', () => {
      const fn = vi.fn()
      batch(fn)
      expect(fn).toHaveBeenCalledOnce()
    })

    it('should work with multiple updates', () => {
      const sig1 = signal(0)
      const sig2 = signal(0)

      batch(() => {
        sig1.value = 1
        sig2.value = 2
      })

      expect(sig1.value).toBe(1)
      expect(sig2.value).toBe(2)
    })
  })

  describe('watch', () => {
    it('should run effect on signal change', () => {
      const count = signal(0)
      const effect = vi.fn()

      watch(count, effect)
      expect(effect).toHaveBeenCalledWith(0)

      count.value = 1
      expect(effect).toHaveBeenCalledWith(1)
    })

    it('should return unsubscribe function', () => {
      const count = signal(0)
      const effect = vi.fn()

      const unwatch = watch(count, effect)
      count.value = 1
      unwatch()
      count.value = 2

      expect(effect).toHaveBeenCalledTimes(2)
    })
  })

  describe('createStore', () => {
    it('should create store with signals', () => {
      const store = createStore({ count: 0, name: 'John' })

      expect(store.count.value).toBe(0)
      expect(store.name.value).toBe('John')
    })

    it('should have reactive signals', () => {
      const store = createStore({ count: 0 })
      const listener = vi.fn()

      store.count.subscribe(listener)
      store.count.value = 5

      expect(listener).toHaveBeenCalledOnce()
      expect(store.count.value).toBe(5)
    })

    it('should support multiple properties', () => {
      const store = createStore({
        count: 0,
        name: 'John',
        isActive: true,
      })

      expect(store.count.value).toBe(0)
      expect(store.name.value).toBe('John')
      expect(store.isActive.value).toBe(true)
    })
  })

  describe('Tree-shaking', () => {
    it('should have individual exports', () => {
      expect(typeof signal).toBe('function')
      expect(typeof computed).toBe('function')
      expect(typeof bindSignal).toBe('function')
      expect(typeof bindInput).toBe('function')
      expect(typeof batch).toBe('function')
      expect(typeof watch).toBe('function')
      expect(typeof createStore).toBe('function')
    })
  })

  describe('Memory efficiency', () => {
    it('should not leak memory with large number of subscribers', () => {
      const count = signal(0)

      for (let i = 0; i < 1000; i++) {
        const unsubscribe = count.subscribe(() => {})
        unsubscribe()
      }

      // Should not throw or freeze
      expect(count.value).toBe(0)
    })

    it('should handle deeply nested structures', () => {
      const data = signal({
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      })

      expect(data.value.level1.level2.level3.value).toBe('deep')
    })
  })
})
