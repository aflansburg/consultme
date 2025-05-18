<script lang="ts">
	import { onMount } from 'svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import {
		generateRandomCombination,
		type AdjectiveType,
		type NounType
	} from '$lib/utils/nameGenerator';
	import ClickMeIcon from '$lib/icons/ClickMeIcon.svelte';

	let randomCombination = '';
	let loading = false;
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = 0;
	let spinnerInterval: ReturnType<typeof setInterval>;

	const handleGenerateRandomCombination = () => {
		loading = true;
		const adjectives = ['celestial', 'serious', 'humorous'];
		const nouns = ['cat', 'animal', 'star'];

		const selectedAdjective = adjectives[
			Math.floor(Math.random() * adjectives.length)
		] as AdjectiveType;
		const selectedNoun = nouns[Math.floor(Math.random() * nouns.length)] as NounType;

		try {
			randomCombination = generateRandomCombination(selectedAdjective, selectedNoun);
		} catch (error) {
			console.error('Error generating random combination:', error);
			randomCombination = 'Error generating combination';
		} finally {
			loading = false;
		}
	};

	const projects = [
		{
			name: 'Spicy Donkey',
			link: 'https://www.npmjs.com/package/spicy-donkey',
			additionalHtmlContent: [
				`
                <p class="text-sm text-gray-200 py-2">
                    Spicy Donkey is a random name generating project nobody asked for with support for CommonJS, ES6 Module, and browser script
                </p>
            `
			]
		},
		{
			name: 'Sample project',
			link: '/projects/sample-project',
			additionalHtmlContent: [
				`
                <p class="text-sm text-gray-200 py-2">
                    Sample project is a random name generating project nobody asked for with support for CommonJS, ES6 Module, and browser script
                </p>
            `
			]
		}
	];

	onMount(() => {
		console.log('Projects page mounted');
		spinnerInterval = setInterval(() => {
			currentSpinnerFrame = (currentSpinnerFrame + 1) % spinnerFrames.length;
		}, 80);

		return () => {
			clearInterval(spinnerInterval);
		};
	});
</script>

<svelte:head>
	<title>{$weirdWord} Projects</title>
</svelte:head>

<div class="projects-container">
	<h1 class="mb-4 text-2xl font-bold">Projects</h1>
	<p class="mb-4">This is a showcase of mostly useless projects I've made.</p>
	<ul role="list" class="divide-y divide-gray-600">
		{#each projects as project}
			<li class="py-4">
				<a href={project.link} class="font-medium text-cyan-400/90 transition-all" target="_blank"
					>{project.name}</a
				>
				{#each project.additionalHtmlContent as content}
					{@html content}
				{/each}
				{#if project.name === 'Spicy Donkey'}
					<div class="flex items-center gap-4">
						<button
							type="button"
							class="inline-flex cursor-pointer items-center gap-2 rounded border border-green-500/30 bg-zinc-800 px-3 py-1.5 text-green-400 transition-all hover:border-green-500/50 hover:bg-zinc-700"
							onclick={handleGenerateRandomCombination}
							aria-label="Generate Random Combination"
						>
							<span class="text-white"><ClickMeIcon /></span>
							{loading ? 'Loading...' : ''}
						</button>
						<p
							class="pulse-animation text-sm text-green-400 {randomCombination
								? 'glow-border'
								: ''}"
						>
							{#if !randomCombination}
								<span class="spinner inline-block">{spinnerFrames[currentSpinnerFrame]}</span>
							{:else}
								{randomCombination}
							{/if}
						</p>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>

<style>
	.pulse-animation {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.glow-border {
		border: 2px solid rgba(34, 197, 94, 0.5);
		box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
	}

	.spinner {
		width: 1em;
		margin-right: 0.5em;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			text-shadow: 0 0 15px rgba(34, 197, 94, 0.8);
		}
		50% {
			opacity: 0.7;
			text-shadow: 0 0 5px rgba(34, 197, 94, 0.4);
		}
	}

	@keyframes glow {
		0%,
		100% {
			text-shadow: 0 0 0px var(--glow-color, #67e8f9);
		}
		50% {
			text-shadow: 0 0 15px var(--glow-color, #67e8f9);
		}
	}
</style>
