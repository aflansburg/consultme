<script lang="ts">
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		console.log('Projects layout mounted');
	});
</script>

<div class="projects-container">
	{@render children()}
</div>

<style>
	.projects-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}
</style>
