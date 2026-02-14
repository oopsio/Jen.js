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
  <button :class="['btn', variant]" @click="emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger';
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn:hover {
  background-color: #f0f0f0;
}

.btn.primary {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.btn.primary:hover {
  background-color: #0056b3;
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
  border-color: #545b62;
}

.btn.secondary:hover {
  background-color: #545b62;
}

.btn.danger {
  background-color: #dc3545;
  color: white;
  border-color: #c82333;
}

.btn.danger:hover {
  background-color: #c82333;
}
</style>
