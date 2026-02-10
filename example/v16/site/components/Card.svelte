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
