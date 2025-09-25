<script lang="ts">
	import { onMount } from 'svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';

	import {
		generateRandomCombination,
		type AdjectiveType,
		type NounType
	} from '$lib/utils/nameGenerator';
	import ClickMeIcon from '$lib/icons/ClickMeIcon.svelte';

	let randomCombination = $state('');
	let loading = $state(false);
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = $state(0);
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
                <p class="text-md text-gray-200 py-2">
                    Spicy Donkey is a random name generating project nobody asked for with support for CommonJS, ES6 Module, and browser script
                </p>
            `
			]
		},
		{
			name: 'This website',
			link: '/',
			additionalHtmlContent: [
				`
                <p class="text-md text-gray-200 py-2">
                    This website is a SvelteKit web application that I use to publish projects, thoughts, contact info, etc.
					<br>
					You can find the source code for this website <a href="https://github.com/aflansburg/consultme" target="_blank">here</a>.
                </p>
				<p class="text-md text-gray-200 py-2 font-bold">
					About this project
				</p>
				<ul class="list-disc list-inside text-md">
					<li>
						Deployed to Google Cloud Run
					</li>
					<li>
						Uses Playwright & a minimal Chromium lib to scrape data from the Rick & Morty Fandom Wiki which is then provided to an LLM (see below)
					</li>
					<li>
						Uses OpenAI's GPT-4 to generate additional information about R&M characters
					</li>
            `
			]
		},
		{
			name: 'Contributor: ScrapeGraphAI',
			link: 'https://github.com/ScrapeGraphAI/Scrapegraph-ai',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					ScrapeGraphAI offers seamless integration with popular frameworks and tools to enhance your scraping capabilities. Whether you're building with Python or Node.js, using LLM frameworks, or working with no-code platforms, we've got you covered with our comprehensive integration options.
				</p>
			`
			]
		}
	];


	onMount(() => {
		console.log('Work page mounted');
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

<div class="projects-container terminal-font" class:dark={$colorMode === 'dark'}>
	<!-- Mobile ASCII Header -->
	<div class="ascii-art mb-4 block sm:hidden">
╔══════════════════════════════════════════════════╗
║               EXPERIMENTAL PROTOTYPES            ║
║               & INVENTIONS DATABASE              ║
╚══════════════════════════════════════════════════╝
	</div>
	<!-- Desktop ASCII Header -->
	<div class="ascii-art mb-6 hidden sm:block">
╔════════════════════════════════════════════════════════════════════════╗
║                    EXPERIMENTAL PROTOTYPES DATABASE                    ║
║                     & QUESTIONABLE INVENTIONS LOG                      ║
╚════════════════════════════════════════════════════════════════════════╝
	</div>
	<h1 class="mb-4 text-2xl font-bold sci-fi-header text-terminal-green">RESEARCH & DEVELOPMENT</h1>
	<p class="mb-4 text-terminal-green">
		> <strong class="text-portal-orange">STATUS REPORT:</strong> Most prototypes serve minimal practical purpose but provided valuable learning experiences.
		Previously focused on proprietary corporate systems. <strong class="text-rick-cyan">CURRENT DIRECTIVE:</strong> Increased open-source contribution protocols initiated.
	</p>
	<ul role="list" class="divide-y divide-terminal-green/20">
		{#each projects as project}
			<li class="py-4 terminal-border rounded-md p-4 mb-4">
				<a href={project.link} class="font-medium text-rick-cyan hover:text-portal-orange transition-all terminal-font" target="_blank"
					>▶ PROTOTYPE: {project.name.toUpperCase()}</a
				>
				{#each project.additionalHtmlContent as content}
					{@html content}
				{/each}
				{#if project.name === 'Spicy Donkey'}
					<div class="flex items-center gap-4">
						<button
							type="button"
							class="inline-flex cursor-pointer items-center gap-2 rounded border border-green-500/30 {$colorMode ===
							'dark'
								? 'bg-zinc-800'
								: 'bg-zinc-200'} px-3 py-1.5 text-green-400 transition-all hover:border-green-500/50 hover:{$colorMode ===
							'dark'
								? 'bg-zinc-700'
								: 'bg-zinc-300'}"
							onclick={handleGenerateRandomCombination}
							aria-label="Generate Random Combination"
						>
							<ClickMeIcon
								className={$colorMode === 'dark' ? 'text-green-300' : 'text-green-600'}
							/>
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

<div class="ascii-art mt-8 text-center">
════════════════════════════════════════════════════════
    END OF EXPERIMENTAL PROTOTYPES DATABASE
    FOR EMPLOYMENT HISTORY:
	<br/>
	<a
        href="https://www.linkedin.com/in/abramflansburg/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-rick-cyan hover:text-portal-orange underline hover:no-underline transition-colors"
    >LINKEDIN.COM/IN/ABRAMFLANSBURG</a>
	<br/>
════════════════════════════════════════════════════════
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

	/* Color mode styles */
	.projects-container {
		color: var(--text-color, #1e293b); /* Default to a dark slate color */
	}

	.projects-container.dark {
		--text-color: #f8fafc; /* Light text for dark mode */
	}

	:global(.dark) .glow-border {
		--glow-color: #22c55e;
	}

	/* Force text color based on color mode */
	:global(.projects-container *) {
		color: #1e293b !important; /* Default text color for light mode */
	}

	:global(.dark .projects-container *) {
		color: #f8fafc !important; /* Light text for dark mode */
	}

	/* Exceptions for links and special elements */
	:global(.projects-container a),
	:global(.projects-container button),
	:global(.projects-container .text-green-400),
	:global(.projects-container .text-cyan-400) {
		color: inherit !important; /* Allow these elements to keep their specific colors */
	}
</style>
