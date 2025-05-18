<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let errorMessage = page.error?.message;
	let dynamicContent = $state<string | null>(null);
	let isLoading = $state(true);

	const fetchErrorPage = async () => {
		try {
			const response = await fetch('/api/dynamic-errors', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: 'Generate a random error page message for this error: ' + errorMessage
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch error page');
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Failed to fetch dynamic content:', error);
			return null;
		}
	};

	onMount(async () => {
		const errorPage = await fetchErrorPage();
		dynamicContent = errorPage?.content || 'Something went wrong. Please try again later.';
		isLoading = false;
	});
</script>

<div class="flex h-screen flex-col items-center justify-center gap-4">
	<div class="relative flex w-full items-center justify-center">
		<span class="animate-pulse-glow absolute z-0 h-24 w-64 rounded-full opacity-60 blur-2xl"></span>
		<h1 class="relative z-10 text-4xl font-bold text-white drop-shadow-lg">Error</h1>
	</div>
	<div>
		<p class="text-xl text-gray-300">{page.status} | {page.error?.message}</p>
	</div>
	{#if isLoading}
		<p class="text-xl">Loading...</p>
	{:else}
		<p class="text-2xl text-red-500">{errorMessage}</p>
		<p class="text-xl text-gray-300">{@html dynamicContent}</p>
		<p class="text-xl text-red-300">This probably really messed up the page when it loaded.</p>
		<p class="text-xl text-red-300">
			That's what you get trying to generate the HTML for an error page with LLMs I guess.
		</p>
	{/if}
</div>

<style>
	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.6;
			box-shadow:
				0 0 40px 20px #ee2222,
				0 0 80px 40px rgba(228, 82, 89, 0.2);
		}
		50% {
			opacity: 1;
			box-shadow:
				0 0 80px 40px #f52072,
				0 0 160px 80px #b400246d;
		}
	}
	.animate-pulse-glow {
		animation: pulse-glow 2s infinite;
	}
</style>
