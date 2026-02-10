<template>
  <div class="vue-demo">
    <div class="navbar">
      <h1>Vue Components Demo</h1>
      <p class="nav-subtitle">Showcasing Vue 3 SFC capabilities</p>
    </div>

    <div class="container">
      <section class="section">
        <h2>Vue Components In Action</h2>
        <p>
          These components are written in Vue 3 Single File Component format
          (.vue) with full TypeScript support.
        </p>

        <div class="grid">
          <VueCounter />
          <VueCard title="Features">
            <ul>
              <li>Reactive state management</li>
              <li>Computed properties</li>
              <li>Component slots</li>
              <li>Event handlers</li>
              <li>Scoped styles</li>
            </ul>
          </VueCard>
        </div>
      </section>

      <section class="section">
        <h2>Component Source Code</h2>

        <h3>VueCounter.vue</h3>
        <div class="code-block">
          <code>
&lt;template&gt;
  &lt;div class="vue-counter"&gt;
    &lt;h3&gt;Vue Counter&lt;/h3&gt;
    &lt;div class="counter-display"&gt;
      &lt;span class="count"&gt;{{ count }}&lt;/span&gt;
    &lt;/div&gt;
    &lt;div class="button-group"&gt;
      &lt;button @click="decrement"&gt;−&lt;/button&gt;
      &lt;button @click="increment"&gt;+&lt;/button&gt;
      &lt;button @click="reset"&gt;Reset&lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
const decrement = () => count.value--;
const reset = () => count.value = 0;
&lt;/script&gt;

&lt;style scoped&gt;
.vue-counter {
  padding: 1.5rem;
  border-radius: 8px;
}
.count {
  font-size: 3rem;
  font-weight: bold;
}
&lt;/style&gt;
          </code>
        </div>

        <h3>VueCard.vue</h3>
        <div class="code-block">
          <code>
&lt;template&gt;
  &lt;div class="vue-card"&gt;
    &lt;div class="card-header" v-if="title"&gt;
      &lt;h4&gt;{{ title }}&lt;/h4&gt;
    &lt;/div&gt;
    &lt;div class="card-body"&gt;
      &lt;slot /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
defineProps&lt;{ title?: string }&gt;();
&lt;/script&gt;

&lt;style scoped&gt;
.vue-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
&lt;/style&gt;
          </code>
        </div>
      </section>

      <section class="section">
        <h2>Key Features</h2>
        <ul>
          <li>
            <strong>&lt;script setup&gt;</strong> - Modern Vue 3 syntax for
            component setup
          </li>
          <li>
            <strong>TypeScript</strong> - Add
            <code>lang="ts"</code> to script tags
          </li>
          <li>
            <strong>Reactive State</strong> - Use
            <code>ref()</code> and <code>reactive()</code>
          </li>
          <li>
            <strong>Scoped Styles</strong> - Add
            <code>scoped</code> to style tags for component isolation
          </li>
          <li>
            <strong>Slots</strong> - Use <code>&lt;slot /&gt;</code> for content
            projection
          </li>
        </ul>
      </section>

      <section class="section">
        <h2>Next Steps</h2>
        <p>
          <a href="/" class="button">← Back to Home</a>
          <a href="/(svelte-demo)" class="button secondary"
            >Svelte Demo →</a
          >
        </p>
      </section>
    </div>

    <footer>
      <p>jen.js v17 • Vue Demo</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import VueCounter from './components/VueCounter.vue';
import VueCard from './components/VueCard.vue';
</script>

<style scoped>
a.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin-right: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &.secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
      background: #f0f0f0;
    }
  }
}

ul {
  list-style: none;
  padding: 0;

  li {
    padding: 0.5rem 0;
    color: #666;
  }
}

code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;
  font-family: "Monaco", monospace;
}
</style>
