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

<template>
  <div class="vue-counter">
    <h3>Vue Counter Component</h3>
    <div class="counter-display">
      <span class="count">{{ count }}</span>
    </div>
    <div class="button-group">
      <button @click="decrement" class="btn btn-secondary">−</button>
      <button @click="increment" class="btn btn-primary">+</button>
      <button @click="reset" class="btn btn-outline">Reset</button>
    </div>
    <div class="info">
      <p v-if="count > 10">Count is high!</p>
      <p v-else-if="count < 0">Count is negative!</p>
      <p v-else>Count is normal</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);

const increment = () => count.value++;
const decrement = () => count.value--;
const reset = () => count.value = 0;

const isHighCount = computed(() => count.value > 10);
</script>

<style scoped>
.vue-counter {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;

  h3 {
    margin-top: 0;
    color: #667eea;
  }

  .counter-display {
    margin: 1.5rem 0;
  }

  .count {
    display: inline-block;
    font-size: 3rem;
    font-weight: bold;
    color: #667eea;
    min-width: 120px;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin: 1rem 0;

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;

      &.btn-primary {
        background: #667eea;
        color: white;

        &:hover {
          background: #5568d3;
        }
      }

      &.btn-secondary {
        background: #764ba2;
        color: white;

        &:hover {
          background: #63408a;
        }
      }

      &.btn-outline {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;

        &:hover {
          background: #f0f0f0;
        }
      }
    }
  }

  .info {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    margin-top: 1rem;

    p {
      margin: 0;
      color: #666;
      font-weight: 500;
    }
  }
}
</style>
