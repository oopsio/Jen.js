<template>
  <div class="home-page">
    <div class="navbar">
      <h1>🎨 jen.js v17</h1>
      <p class="nav-subtitle">Vue + Svelte Integration Demo</p>
    </div>

    <div class="container">
      <section class="section">
        <h2>Welcome to Vue + Svelte in jen.js</h2>
        <p>
          This example demonstrates first-class support for Vue 3 Single File
          Components and Svelte 4 components within the jen.js framework.
        </p>

        <div class="stats">
          <div class="stat">
            <div class="value">3</div>
            <div class="label">Framework Support</div>
          </div>
          <div class="stat">
            <div class="value">4</div>
            <div class="label">Example Components</div>
          </div>
          <div class="stat">
            <div class="value">100%</div>
            <div class="label">Type Safe</div>
          </div>
        </div>

        <h3>Supported Frameworks</h3>
        <div class="grid">
          <div class="card">
            <h4>🖖 Vue 3</h4>
            <p>
              Full Vue 3 SFC support with <code>&lt;script setup&gt;</code>,
              TypeScript, and reactive features.
            </p>
          </div>
          <div class="card">
            <h4>⚡ Svelte 4</h4>
            <p>
              Reactive Svelte components with TypeScript, stores, and scoped
              styles.
            </p>
          </div>
          <div class="card">
            <h4>⚛️ Preact</h4>
            <p>
              Native Preact components. Mix with Vue and Svelte components
              seamlessly.
            </p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>🎯 Navigation</h2>
        <div class="grid">
          <router-link to="/vue-demo" class="button"
            >Vue Demo →</router-link
          >
          <router-link to="/svelte-demo" class="button"
            >Svelte Demo →</router-link
          >
          <router-link to="/mixed-demo" class="button"
            >Mixed Demo →</router-link
          >
        </div>
      </section>

      <section class="section">
        <h2>📖 Features</h2>
        <ul style="list-style: none; padding: 0">
          <li>✓ Vue 3 SFC compilation</li>
          <li>✓ Svelte 4 component support</li>
          <li>✓ TypeScript support in both</li>
          <li>✓ Hot Module Replacement (HMR)</li>
          <li>✓ Runtime import with jen.import()</li>
          <li>✓ Production bundling</li>
          <li>✓ Scoped styles</li>
          <li>✓ Component slots and props</li>
        </ul>
      </section>

      <section class="section">
        <h2>🚀 Quick Start</h2>
        <div class="code-block">
          <code>
# Create Vue component
cat > site/components/Button.vue &lt;&lt; EOF
&lt;template&gt;
  &lt;button @click="$emit('click')"&gt;
    &lt;slot /&gt;
  &lt;/button&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
const emit = defineEmits&lt;{ click: [] }&gt;();
&lt;/script&gt;
EOF

# Start dev server
npm run dev

# Build for production
npm run build
          </code>
        </div>
      </section>
    </div>

    <footer>
      <p>jen.js v17 • Vue + Svelte Integration Demo</p>
      <p>
        <a href="https://github.com/kessud2021/Jen.js" target="_blank"
          >GitHub</a
        >
        |
        <a href="https://jen.js.org" target="_blank">Documentation</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Navigation links (for demo purposes)
const routerLink = ({ to }: any) => to;
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
}

ul {
  list-style: none;
  padding: 0;

  li {
    padding: 0.5rem 0;
    color: #666;
    font-size: 1.125rem;

    &:before {
      content: "";
      margin-right: 0.5rem;
    }
  }
}

a[class="button"] {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;
  font-family: "Monaco", monospace;
  font-size: 0.9em;
}
</style>
