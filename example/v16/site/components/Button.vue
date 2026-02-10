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
