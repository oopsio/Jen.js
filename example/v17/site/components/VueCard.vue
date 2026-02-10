<template>
  <div class="vue-card">
    <div class="card-header" v-if="title">
      <h4>{{ title }}</h4>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style scoped>
.vue-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
  }

  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-footer {
    padding: 1rem;
    background: #f9f9f9;
    border-top: 1px solid #e0e0e0;
  }
}
</style>
