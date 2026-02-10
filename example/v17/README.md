# jen.js v17 - Vue + Svelte Integration Demo

A complete example demonstrating Vue 3 SFC, Svelte 4, and Preact components working together in jen.js.

## Overview

This example showcases:

- ✅ Vue 3 Single File Components (`.vue`)
- ✅ Svelte 4 Components (`.svelte`)
- ✅ Preact Components (`.tsx`)
- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript Support
- ✅ Component Reusability
- ✅ Production Builds

## Project Structure

```
example/v17/
├── site/
│   ├── components/
│   │   ├── VueCounter.vue       # Vue component with reactive state
│   │   ├── VueCard.vue          # Vue component with slots
│   │   ├── SvelteTimer.svelte   # Svelte timer with lifecycle
│   │   └── SvelteList.svelte    # Svelte list with reactivity
│   │
│   ├── (home).vue               # Home page in Vue
│   ├── (vue-demo).vue           # Vue demo page
│   ├── (svelte-demo).svelte     # Svelte demo page
│   ├── (mixed-demo).tsx         # Mixed demo in Preact
│   │
│   └── styles.scss              # Global styles
│
├── jen.config.ts                # Framework configuration
└── package.json                 # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# From the root jen.js directory
cd example/v17

# Install dependencies (from root)
npm install
# or
pnpm install
```

### Development

```bash
# Start dev server with HMR
npm run dev

# Visit http://localhost:3000
```

The server will watch for changes to:
- `.vue` files (Vue components)
- `.svelte` files (Svelte components)
- `.tsx` files (Preact components)
- `.scss` files (Stylesheets)

Changes trigger automatic browser reload via HMR.

### Production Build

```bash
npm run build
```

Outputs to `dist/` directory:
- Static HTML files
- Compiled component code
- Optimized CSS
- Asset files

## Pages

### 🏠 Home Page (`/(home).vue`)

Vue component showcasing:
- Framework overview
- Navigation to demos
- Feature highlights
- Quick start guide

**Components used:**
- `<template>`, `<script setup>`, `<style scoped>`
- Vue 3 reactive features

### 🖖 Vue Demo (`/(vue-demo).vue`)

Demonstrates Vue 3 SFC features:
- `VueCounter` - Reactive state with ref()
- `VueCard` - Slots and props

**Features:**
- Template directives (v-if, v-for)
- Event handlers (@click)
- Computed properties
- Component composition

### ⚡ Svelte Demo (`/(svelte-demo).svelte`)

Demonstrates Svelte 4 features:
- `SvelteTimer` - Reactive state and lifecycle
- `SvelteList` - Two-way binding with bind:

**Features:**
- Reactive assignments
- Component lifecycle (onMount)
- Two-way binding
- Scoped styles (automatic)
- Block statements (#each, #if)

### 🎭 Mixed Demo (`/(mixed-demo).tsx`)

Shows all three frameworks working together:
- Preact route with hooks
- Links to Vue and Svelte pages
- Architecture overview

## Components

### Vue Components

#### VueCounter.vue
```vue
<template>
  <div>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
const increment = () => count.value++;
</script>
```

**Features:**
- Reactive state with `ref()`
- Template interpolation
- Event handlers
- Scoped styles

#### VueCard.vue
```vue
<template>
  <div class="vue-card">
    <div class="card-header">{{ title }}</div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>
```

**Features:**
- Component props with TypeScript
- Slot content projection
- Header/body layout

### Svelte Components

#### SvelteTimer.svelte
```svelte
<script lang="ts">
  let seconds = 0;
  let isRunning = false;

  const toggle = () => {
    isRunning = !isRunning;
    // ...
  };
</script>

<div>{formatTime(seconds)}</div>
<button on:click={toggle}>
  {isRunning ? 'Pause' : 'Start'}
</button>
```

**Features:**
- Reactive state (auto-subscriptions)
- Event handlers (on:click)
- Conditional rendering
- Function composition

#### SvelteList.svelte
```svelte
<script lang="ts">
  export let items: Item[] = [];

  const addItem = () => {
    items = [...items, newItem];
  };
</script>

{#each items as item (item.id)}
  <li>{item.text}</li>
{/each}
```

**Features:**
- Exported props
- Reactive arrays
- Block statements (#each)
- List key binding

## Development Workflow

### Editing Components

1. **Edit a Vue component:**
   ```bash
   # Edit site/components/VueCounter.vue
   # Browser auto-reloads
   ```

2. **Edit a Svelte component:**
   ```bash
   # Edit site/components/SvelteTimer.svelte
   # Browser auto-reloads
   ```

3. **Edit global styles:**
   ```bash
   # Edit site/styles.scss
   # Styles hot-update
   ```

### Adding New Components

**Vue Component:**
```bash
cat > site/components/MyComponent.vue << 'EOF'
<template>
  <div>
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<style scoped>
h2 { color: #667eea; }
</style>
EOF
```

**Svelte Component:**
```bash
cat > site/components/MyComponent.svelte << 'EOF'
<script lang="ts">
  export let title: string;
</script>

<div>
  <h2>{title}</h2>
  <slot />
</div>

<style>
  h2 { color: #667eea; }
</style>
EOF
```

**Preact Component:**
```bash
cat > site/components/MyComponent.tsx << 'EOF'
import { h } from 'preact';

export default function MyComponent({ title }: { title: string }) {
  return h('div', null, h('h2', null, title));
}
EOF
```

## Build Output

```
dist/
├── index.html              # Home page
├── vue-demo/
│   └── index.html         # Vue demo page
├── svelte-demo/
│   └── index.html         # Svelte demo page
├── mixed-demo/
│   └── index.html         # Mixed demo page
├── components/            # Compiled components
│   ├── VueCounter.*
│   ├── VueCard.*
│   ├── SvelteTimer.*
│   └── SvelteList.*
└── styles.css             # Global stylesheet
```

## Performance

- **Development**: ~50-100ms reload time (HMR)
- **Build**: ~2-5s for full build
- **Component Size**: ~500 bytes min+gzip per component

## Browser Support

- Modern browsers (ES2022)
- Chrome, Firefox, Safari, Edge (latest versions)

## TypeScript Support

All components support TypeScript:

**Vue:**
```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

withDefaults(defineProps<Props>(), { count: 0 })
</script>
```

**Svelte:**
```svelte
<script lang="ts">
interface Item {
  id: string;
  name: string;
}

export let items: Item[] = [];
</script>
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
npm install
```

### HMR Not Working

1. Check browser console for errors
2. Verify `.vue` and `.svelte` files are in `site/` directory
3. Restart dev server: Ctrl+C and `npm run dev`

### Build Fails

```bash
# Check TypeScript
npm run typecheck

# Clean build
rm -rf dist
npm run build
```

## Next Steps

1. Explore the example pages by running `npm run dev`
2. Modify components and observe HMR
3. Read [VUE_SVELTE_IMPLEMENTATION.md](../../VUE_SVELTE_IMPLEMENTATION.md) for architecture details
4. Check [QUICK_START_VUE_SVELTE.md](../../QUICK_START_VUE_SVELTE.md) for integration guide

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Svelte Documentation](https://svelte.dev/)
- [Preact Documentation](https://preactjs.com/)
- [jen.js Framework](https://github.com/kessud2021/Jen.js)

## License

MIT

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

Built with ❤️ using jen.js v17
