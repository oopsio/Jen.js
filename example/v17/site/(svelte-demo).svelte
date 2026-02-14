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

<script lang="ts">
  import SvelteTimer from './components/SvelteTimer.svelte';
  import SvelteList from './components/SvelteList.svelte';

  interface Item {
    id: string;
    text: string;
    done: boolean;
  }

  let todoItems: Item[] = [
    { id: '1', text: 'Learn Svelte', done: true },
    { id: '2', text: 'Build a component', done: true },
    { id: '3', text: 'Deploy to production', done: false },
  ];
</script>

<div class="svelte-demo">
  <div class="navbar">
    <h1>⚡ Svelte Components Demo</h1>
    <p class="nav-subtitle">Showcasing Svelte 4 capabilities</p>
  </div>

  <div class="container">
    <section class="section">
      <h2>Svelte Components In Action</h2>
      <p>
        These components are written in Svelte 4 format (.svelte) with reactive
        statements and full TypeScript support.
      </p>

      <div class="grid">
        <SvelteTimer />
        <SvelteList title="My Tasks" bind:items={todoItems} />
      </div>
    </section>

    <section class="section">
      <h2>Component Source Code</h2>

      <h3>SvelteTimer.svelte</h3>
      <div class="code-block">
        <code>
&lt;script lang="ts"&gt;
  import { onMount } from 'svelte';

  let seconds = 0;
  let isRunning = false;

  const toggle = () => {
    isRunning = !isRunning;
    if (isRunning) {
      setInterval(() => {
        seconds++;
      }, 1000);
    }
  };

  const reset = () => {
    isRunning = false;
    seconds = 0;
  };
&lt;/script&gt;

&lt;div class="timer"&gt;
  &lt;code&gt;{seconds.toString().padStart(2, '0')}&lt;/code&gt;
  &lt;button on:click={toggle}&gt;
    {isRunning ? 'Pause' : 'Start'}
  &lt;/button&gt;
  &lt;button on:click={reset}&gt;Reset&lt;/button&gt;
&lt;/div&gt;
        </code>
      </div>

      <h3>SvelteList.svelte</h3>
      <div class="code-block">
        <code>
&lt;script lang="ts"&gt;
  interface Item {
    id: string;
    text: string;
    done: boolean;
  }

  export let items: Item[] = [];

  const addItem = (text: string) => {
    items = [...items, {
      id: Date.now().toString(),
      text,
      done: false
    }];
  };

  const toggleItem = (id: string) => {
    items = items.map(item =>
      item.id === id ? {...item, done: !item.done} : item
    );
  };
&lt;/script&gt;

{#each items as item (item.id)}
  &lt;div on:click={() => toggleItem(item.id)}&gt;
    &lt;input type="checkbox" checked={item.done} /&gt;
    &lt;span&gt;{item.text}&lt;/span&gt;
  &lt;/div&gt;
{/each}
        </code>
      </div>
    </section>

    <section class="section">
      <h2>Key Features</h2>
      <ul>
        <li>
          <strong>Reactive Assignments</strong> - Just assign to variables and
          UI updates automatically
        </li>
        <li>
          <strong>TypeScript Support</strong> - Add
          <code>lang="ts"</code> to script tags
        </li>
        <li>
          <strong>Component Lifecycle</strong> - Use
          <code>onMount</code>,
          <code>onDestroy</code>, etc.
        </li>
        <li>
          <strong>Two-way Binding</strong> - Use
          <code>bind:</code> for reactive props
        </li>
        <li>
          <strong>Scoped Styles</strong> - Styles are automatically scoped to
          components
        </li>
        <li>
          <strong>Animations</strong> - Built-in animation directives
        </li>
      </ul>
    </section>

    <section class="section">
      <h2>About Svelte</h2>
      <p>
        Svelte is a radical new approach to building user interfaces. While
        traditional frameworks like React and Vue do the bulk of their work in
        the browser, Svelte shifts that work into a compile step that happens
        when you build your app.
      </p>
      <p>
        This means you can write beautifully simple component code, and the
        compiler takes care of turning it into super efficient vanilla
        JavaScript.
      </p>
    </section>

    <section class="section">
      <h2>Next Steps</h2>
      <p>
        <a href="/" class="button">← Back to Home</a>
        <a href="/(vue-demo)" class="button secondary">← Vue Demo</a>
        <a href="/(mixed-demo)" class="button secondary">Mixed Demo →</a>
      </p>
    </section>
  </div>

  <footer>
    <p>jen.js v17 • Svelte Demo</p>
  </footer>
</div>

<style>
  a.button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    margin-right: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: all 0.2s;
  }

  a.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  a.button.secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }

  a.button.secondary:hover {
    background: #f0f0f0;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  ul li {
    padding: 0.5rem 0;
    color: #666;
  }

  code {
    background: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 2px;
    font-family: "Monaco", monospace;
  }
</style>
