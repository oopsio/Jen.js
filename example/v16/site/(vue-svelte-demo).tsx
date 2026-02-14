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

import { h } from "preact";

/**
 * Vue + Svelte Demo Page
 * 
 * This page demonstrates how to import and use Vue SFC and Svelte components
 * in jen.js routes.
 * 
 * Note: In a real implementation, you would import these as modules.
 * For now, this is a guide showing the syntax.
 */

export default function VueSvelteDemo() {
  return h("div", { class: "container" }, [
    h("h1", null, "Vue + Svelte Components Demo"),

    h("section", { class: "demo-section" }, [
      h("h2", null, "About Vue & Svelte Support"),
      h(
        "p",
        null,
        "jen.js now supports Vue Single File Components (.vue) and Svelte components (.svelte) alongside native Preact components.",
      ),
    ]),

    h("section", { class: "demo-section" }, [
      h("h2", null, "Vue Components"),
      h("p", null, "Example Vue button (Button.vue):"),
      h(
        "pre",
        { class: "code-block" },
        `<template>
  <button @click="emit('click')" class="btn">
    <slot />
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{ click: [] }>();
</script>`,
      ),
    ]),

    h("section", { class: "demo-section" }, [
      h("h2", null, "Svelte Components"),
      h("p", null, "Example Svelte card (Card.svelte):"),
      h(
        "pre",
        { class: "code-block" },
        `<script lang="ts">
  export let title: string = '';
</script>

<div class="card">
  <h2>{title}</h2>
  <slot />
</div>

<style>
  .card { border: 1px solid #ddd; }
</style>`,
      ),
    ]),

    h("section", { class: "demo-section" }, [
      h("h2", null, "Importing Components"),
      h(
        "p",
        null,
        "Use jen.import() to dynamically import .vue and .svelte components:",
      ),
      h(
        "pre",
        { class: "code-block" },
        `import { jen } from '@src/index.js';

// Import at runtime
const Button = await jen.import('./components/Button.vue');
const Card = await jen.import('./components/Card.svelte');

// Or import in dev/build
import Button from './components/Button.vue';
import Card from './components/Card.svelte';`,
      ),
    ]),

    h("section", { class: "demo-section" }, [
      h("h2", null, "Features"),
      h("ul", null, [
        h("li", null, "✓ Vue 3 SFC support (<template>, <script setup>, <style scoped>)"),
        h("li", null, "✓ Svelte 4 component support (TypeScript, reactive)"),
        h("li", null, "✓ esbuild integration for fast compilation"),
        h("li", null, "✓ HMR support for dev server"),
        h("li", null, "✓ CSS/SCSS compilation"),
        h("li", null, "✓ Production bundling"),
        h("li", null, "✓ Runtime import with jen.import()"),
      ]),
    ]),

    h("section", { class: "demo-section" }, [
      h("h2", null, "Files"),
      h("ul", null, [
        h("li", null, "src/compilers/vue.ts - Vue compiler"),
        h("li", null, "src/compilers/svelte.ts - Svelte compiler"),
        h("li", null, "src/compilers/esbuild-plugins.ts - esbuild plugins"),
        h("li", null, "src/import/jen-import.ts - Runtime importer"),
        h("li", null, "site/components/Button.vue - Example Vue button"),
        h("li", null, "site/components/Card.svelte - Example Svelte card"),
      ]),
    ]),

    h("section", { class: "demo-section info" }, [
      h(
        "p",
        null,
        "Visit the components folder to see working examples. Read the generated component files for full details.",
      ),
    ]),
  ]);
}

// Styles
import "./demo.scss";
