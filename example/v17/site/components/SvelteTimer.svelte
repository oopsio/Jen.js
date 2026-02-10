<script lang="ts">
  import { onMount } from 'svelte';

  let seconds = 0;
  let isRunning = false;
  let interval: any = null;

  const toggle = () => {
    isRunning = !isRunning;
    if (isRunning) {
      interval = setInterval(() => {
        seconds++;
      }, 1000);
    } else {
      clearInterval(interval);
    }
  };

  const reset = () => {
    isRunning = false;
    seconds = 0;
    clearInterval(interval);
  };

  onMount(() => {
    return () => {
      clearInterval(interval);
    };
  });

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
</script>

<div class="svelte-timer">
  <h3>Svelte Timer Component</h3>
  <div class="timer-display">
    <code>{formatTime(seconds)}</code>
  </div>
  <div class="button-group">
    <button on:click={toggle} class="btn btn-primary">
      {isRunning ? 'Pause' : 'Start'}
    </button>
    <button on:click={reset} class="btn btn-secondary">Reset</button>
  </div>
  <div class="info">
    <p>Status: <strong>{isRunning ? 'Running...' : 'Stopped'}</strong></p>
  </div>
</div>

<style>
  .svelte-timer {
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border: 2px dashed #764ba2;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
  }

  h3 {
    margin-top: 0;
    color: #764ba2;
  }

  .timer-display {
    margin: 1.5rem 0;
  }

  code {
    display: inline-block;
    font-size: 2.5rem;
    font-weight: bold;
    color: #764ba2;
    background: white;
    padding: 1rem 2rem;
    border-radius: 4px;
    font-family: "Monaco", monospace;
    min-width: 200px;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin: 1rem 0;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;

    &.btn-primary {
      background: #667eea;
      color: white;

      &:hover {
        background: #5568d3;
      }
    }

    &.btn-secondary {
      background: #764ba2;
      color: white;

      &:hover {
        background: #63408a;
      }
    }
  }

  .info {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    margin-top: 1rem;
  }

  p {
    margin: 0;
    color: #666;
  }
</style>
