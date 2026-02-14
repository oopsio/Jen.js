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
  interface Item {
    id: string;
    text: string;
    done: boolean;
  }

  export let title = 'Todo List';
  export let items: Item[] = [];

  let newItem = '';

  const addItem = () => {
    if (newItem.trim()) {
      items = [
        ...items,
        {
          id: Date.now().toString(),
          text: newItem,
          done: false,
        },
      ];
      newItem = '';
    }
  };

  const toggleItem = (id: string) => {
    items = items.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    );
  };

  const removeItem = (id: string) => {
    items = items.filter(item => item.id !== id);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };
</script>

<div class="svelte-list">
  <h3>{title}</h3>
  <div class="input-group">
    <input
      type="text"
      placeholder="Add a new item..."
      bind:value={newItem}
      on:keydown={handleKeydown}
    />
    <button on:click={addItem} class="btn btn-primary">Add</button>
  </div>

  {#if items.length === 0}
    <div class="empty-state">
      <p>No items yet. Add one to get started!</p>
    </div>
  {:else}
    <ul class="items-list">
      {#each items as item (item.id)}
        <li class:done={item.done}>
          <input
            type="checkbox"
            checked={item.done}
            on:change={() => toggleItem(item.id)}
          />
          <span>{item.text}</span>
          <button
            on:click={() => removeItem(item.id)}
            class="btn btn-delete"
            title="Delete"
          >
            ×
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="stats">
    <span>{items.filter(i => !i.done).length} remaining</span>
    <span>{items.filter(i => i.done).length} done</span>
  </div>
</div>

<style>
  .svelte-list {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;

    h3 {
      margin-top: 0;
      color: #764ba2;
    }
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;

    input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #764ba2;
        box-shadow: 0 0 0 2px #764ba215;
      }
    }

    .btn {
      padding: 0.5rem 1rem;
      background: #764ba2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;

      &:hover {
        background: #63408a;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #999;
  }

  .items-list {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f9f9f9;
      }

      &.done span {
        text-decoration: line-through;
        color: #999;
      }

      input[type='checkbox'] {
        cursor: pointer;
      }

      span {
        flex: 1;
        cursor: pointer;
      }

      .btn-delete {
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;

        &:hover {
          background: #cc0000;
        }
      }
    }
  }

  .stats {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
    font-size: 0.875rem;
    color: #666;

    span {
      font-weight: 500;
    }
  }
</style>
