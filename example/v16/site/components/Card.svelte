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
  export let title: string = '';
  export let subtitle: string = '';
</script>

<div class="card">
  {#if title}
    <div class="card-header">
      <h2 class="card-title">{title}</h2>
      {#if subtitle}
        <p class="card-subtitle">{subtitle}</p>
      {/if}
    </div>
  {/if}
  <div class="card-body">
    <slot />
  </div>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background: white;
  }

  .card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    background-color: #f8f9fa;
  }

  .card-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .card-subtitle {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: #666;
  }

  .card-body {
    padding: 1.5rem;
  }
</style>
