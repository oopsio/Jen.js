<script lang="ts">
	// Import your favicon if it's in the src folder, 
	// or just use a string path if it's in /static
	
	let { children } = $props(); // Required for Svelte 5 to render child pages
</script>

<svelte:head>
  <title>SvelteKit Benchmark</title>
</svelte:head>

{@render children()}
