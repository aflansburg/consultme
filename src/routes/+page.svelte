<script lang="ts">
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCharacter, searchCharacters } from '$lib/rickandmorty/character';
	import SearchIcon from '$lib/components/SearchIcon.svelte';
	import { PUBLIC_MY_NAME, PUBLIC_AVATAR_IMG_PATH } from '$env/static/public';
	import { avatarImage } from '$lib/stores/avatarImage.svelte';
	import { name, identityRevealed } from '$lib/stores/identity.svelte';
	import {
		GitHubIcon,
		ClickMeIcon,
		GreenCheckIcon,
		TerminalBootSequence
	} from '@aflansburg/terminal-ui';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { bootSequenceStore } from '$lib/stores/bootSequenceStore.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import ThreeJsPortal from '$lib/components/ThreeJsPortal.svelte';
	import CharacterInfoModal from '$lib/components/CharacterInfoModal.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let character = $state(data.character);
	let aiResponse = $state('');
	let loading = $state(false);
	let fetchStarted = $state(false);
	let characterLoading = $state(true);
	let showSearchInput = $state(false);
	let searchQuery = $state('');
	let searchLoading = $state(false);
	let searchMessage = $state('');
	let searchResults: { id: number; name: string; status: string; species: string; type: string; gender: string; origin: { name: string; url: string }; location: { name: string; url: string }; image: string; episode: string[]; url: string; created: string }[] = $state([]);
	let searchTimer: ReturnType<typeof setTimeout> | null = null;
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = $state(0);
	let spinnerInterval: ReturnType<typeof setInterval>;
	const cannedAiErrorResponse = `Failed to load additional information.`;
	const myName = PUBLIC_MY_NAME;
	let showModal = $state(false);

	// Mobile collapsible sections
	let showIdentitySection = $state(false);
	let showArchitectureSection = $state(false);
	let imageLoaded = $state(false);
	let imageError = $state(false);
	let terminalLogs = $state<string[]>([]);
	let streamAbortController: AbortController | undefined;

	async function fetchCharacterInfo() {
		// Cancel any previous in-flight request
		streamAbortController?.abort();
		streamAbortController = new AbortController();

		loading = true;
		fetchStarted = true;
		aiResponse = '';
		terminalLogs = [];

		// Add initial log
		terminalLogs = [...terminalLogs, '> INITIATING_CITADEL_DATABASE_ACCESS...'];

		try {
			const response = await fetch('/api/character-info-stream', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					characterName: character.name
				}),
				signal: streamAbortController.signal
			});

			if (!response.body) {
				throw new Error('No response body');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				buffer += chunk;
				const lines = buffer.split('\n');

				// Keep the last incomplete line in the buffer
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));

							if (data.type === 'log') {
								terminalLogs = [...terminalLogs, `[${data.timestamp}] ${data.message}`];
							} else if (data.type === 'complete') {
								aiResponse = data.data.info;
								loading = false;
							} else if (data.type === 'error') {
								aiResponse = `**Error:**\n${cannedAiErrorResponse} ${data.message}`;
								loading = false;
							}
						} catch (parseError) {
							console.warn('Failed to parse SSE data:', line, parseError);
						}
					}
				}
			}
		} catch (error: any) {
			if (error?.name === 'AbortError') return;
			aiResponse = `**Error:**\n${cannedAiErrorResponse} ${error}`;
			terminalLogs = [...terminalLogs, '> ERROR: CONNECTION_TO_CITADEL_LOST'];
			loading = false;
		}
	}

	async function loadRandomCharacter() {
		characterLoading = true;
		imageLoaded = false;
		imageError = false;

		try {
			const response = await fetch('/api/random-character');
			if (response.ok) {
				const newCharacter = await response.json();
				character = newCharacter;
			} else {
				console.error('Failed to fetch random character');
			}
		} catch (error) {
			console.error('Error loading random character:', error);
		} finally {
			characterLoading = false;
		}
	}

	async function fetchRandomCharacter() {
		aiResponse = '';
		fetchStarted = false;
		await loadRandomCharacter();
	}

	function selectSearchResult(result: typeof character) {
		searchResults = [];
		searchMessage = '';
		character = result;
		characterLoading = false;
		imageLoaded = false;
		imageError = false;
		aiResponse = '';
		fetchStarted = false;
	}

	async function handleSearch() {
		if (!searchQuery.trim()) return;
		searchLoading = true;
		searchMessage = '';
		searchResults = [];

		searchTimer = setTimeout(() => {
			searchMessage = '> HANG ON, STILL SEARCHING...';
		}, 2000);

		try {
			const results = await searchCharacters(searchQuery);
			if (results.results && results.results.length > 1) {
				searchResults = results.results;
				searchMessage = '';
			} else if (results.results && results.results.length === 1) {
				selectSearchResult(results.results[0]);
			} else {
				searchMessage = '> ENTITY NOT FOUND IN CITADEL DATABASE';
			}
		} catch (error) {
			console.error('Search failed:', error);
			searchMessage = '> ENTITY NOT FOUND IN CITADEL DATABASE';
		} finally {
			if (searchTimer) {
				clearTimeout(searchTimer);
				searchTimer = null;
			}
			searchLoading = false;
		}
	}

	let errorMessage = $state('');

	async function fetchRickSanchez() {
		loading = true;
		errorMessage = '';

		try {
			const rick = await getCharacter(1);
			character = rick;
			aiResponse = '';
			fetchStarted = false;
			imageLoaded = false; // Reset image loaded state
			imageError = false; // Reset image error state
			loading = false;
		} catch (error) {
			console.error('Failed to fetch Rick Sanchez:', error);
			errorMessage = 'Failed to load Rick Sanchez. Please try again.';
			loading = false;
		}
	}

	// Add keyboard event handler for modal
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showModal) {
			toggleModal();
		}
	}

	function revealIdentity() {
		avatarImage.set('/' + PUBLIC_AVATAR_IMG_PATH);
		name.set(PUBLIC_MY_NAME);
		identityRevealed.set(true);
	}

	onMount(async () => {
		spinnerInterval = setInterval(() => {
			currentSpinnerFrame = (currentSpinnerFrame + 1) % spinnerFrames.length;
		}, 80);

		// Add keyboard event listener
		window.addEventListener('keydown', handleKeydown);

		// Load character data on mount
		await loadRandomCharacter();

		return () => {
			clearInterval(spinnerInterval);
			window.removeEventListener('keydown', handleKeydown);
			streamAbortController?.abort();
		};
	});

	function toggleModal() {
		if (!showModal && !aiResponse) {
			fetchCharacterInfo();
		}
		showModal = !showModal;
	}

	function handleReboot() {
		bootSequenceStore.reset();
		// Reload the page to show the boot sequence
		window.location.reload();
	}
</script>

<SEO
	title="Abe Flansburg | AI Solutions Architect Consultant — Houston, Austin & San Antonio, TX"
	description="Abe Flansburg — AI Solutions Architect Consultant, Software Engineer, Data Scientist & ML Engineer serving Houston, Austin, and San Antonio, Texas. Specializing in healthcare AI, energy, and oil & gas solutions."
	keywords="AI solutions architect, AI solutions architect consultant, AI solutions architect consultant Houston, AI solutions architect consultant Austin, AI solutions architect consultant San Antonio, AI solutions architect consultant healthcare, AI software engineer Houston, data science consultant Texas, ML engineer Houston Austin, healthcare AI consultant, energy AI consultant, oil and gas AI, AI consultant Texas"
	canonical="https://engabe.com"
/>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "Person",
		"name": "Abe Flansburg",
		"alternateName": "Abram Flansburg",
		"url": "https://engabe.com",
		"image": "https://engabe.com/af-profile-sm.png",
		"jobTitle": "AI Solutions Architect Consultant",
		"description": "AI Solutions Architect Consultant specializing in healthcare, energy, and oil & gas. Expert in software engineering, data science, and machine learning across Houston, Austin, and San Antonio, Texas.",
		"knowsAbout": [
			"Artificial Intelligence",
			"Solutions Architecture",
			"Machine Learning",
			"Data Science",
			"Software Engineering",
			"Healthcare AI",
			"Energy Sector AI",
			"Oil and Gas Technology",
			"Cloud Architecture",
			"AI Strategy Consulting"
		],
		"hasOccupation": {
			"@type": "Occupation",
			"name": "AI Solutions Architect Consultant",
			"occupationalCategory": "15-1299.08",
			"skills": "AI Architecture, Machine Learning, Data Science, Software Engineering, Cloud Infrastructure, Healthcare IT, Energy Technology"
		},
		"worksFor": { "@type": "Organization", "name": "Self-Employed" },
		"sameAs": [
			"https://github.com/aflansburg",
			"https://www.linkedin.com/in/abramflansburg/",
			"https://soundcloud.com/user-271844266"
		],
		"address": {
			"@type": "PostalAddress",
			"addressLocality": "Houston",
			"addressRegion": "TX",
			"addressCountry": "US"
		},
		"areaServed": [
			{ "@type": "City", "name": "Houston", "containedInPlace": { "@type": "State", "name": "Texas" } },
			{ "@type": "City", "name": "Austin", "containedInPlace": { "@type": "State", "name": "Texas" } },
			{ "@type": "City", "name": "San Antonio", "containedInPlace": { "@type": "State", "name": "Texas" } }
		]
	})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "ProfessionalService",
		"name": "Abe Flansburg — AI Solutions Architect Consulting",
		"description": "AI solutions architecture consulting for healthcare, energy, and oil & gas industries. Expert software engineering, data science, and machine learning services in Houston, Austin, and San Antonio, Texas.",
		"url": "https://engabe.com",
		"image": "https://engabe.com/af-profile-sm.png",
		"telephone": "",
		"priceRange": "$$$$",
		"areaServed": [
			{ "@type": "City", "name": "Houston" },
			{ "@type": "City", "name": "Austin" },
			{ "@type": "City", "name": "San Antonio" },
			{ "@type": "State", "name": "Texas" }
		],
		"serviceType": [
			"AI Solutions Architecture",
			"AI Strategy Consulting",
			"Machine Learning Engineering",
			"Data Science Consulting",
			"Healthcare AI Solutions",
			"Energy Sector AI Solutions",
			"Oil and Gas AI Consulting",
			"Software Engineering"
		],
		"knowsAbout": [
			"Artificial Intelligence",
			"Machine Learning",
			"Data Science",
			"Healthcare Technology",
			"Energy Technology",
			"Oil and Gas Technology",
			"Cloud Architecture",
			"Software Development"
		],
		"address": {
			"@type": "PostalAddress",
			"addressLocality": "Houston",
			"addressRegion": "TX",
			"addressCountry": "US"
		},
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": 29.7604,
			"longitude": -95.3698
		}
	})}</script>`}
</svelte:head>

<section class="sr-only" aria-label="About Abe Flansburg — AI Solutions Architect Consultant">
	<h1>Abe Flansburg — AI Solutions Architect Consultant in Houston, Austin & San Antonio, Texas</h1>
	<p>Abe Flansburg is an AI Solutions Architect Consultant based in Houston, Texas, serving clients across Austin, San Antonio, and the greater Texas region. As a seasoned software engineer, data scientist, and machine learning engineer, Abe specializes in designing and implementing AI solutions for the healthcare, energy, and oil & gas industries.</p>
	<p>With deep expertise in AI architecture, cloud infrastructure, and full-stack software development, Abe delivers end-to-end AI consulting services — from strategy and solution design to hands-on engineering and deployment. Whether you need an AI solutions architect consultant in Houston, an ML engineer in Austin, or a data science consultant in San Antonio, Abe brings cross-industry experience and technical depth to every engagement.</p>
</section>

<TerminalBootSequence
	shouldShow={bootSequenceStore.shouldShowBootSequence}
	systemDesignation="C-137-INFO"
	onComplete={() => bootSequenceStore.markAsViewed()}
/>

<div class="container mx-auto px-2 pt-2 sm:px-4 sm:pt-2 pb-8">
	<div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_2fr] lg:gap-8">
		<div class="space-y-2 sm:space-y-3">
			<div class="ascii-art my-6">
> PERSONNEL FILE ACCESS INITIATED...
> SCANNING DIMENSION C-137 DATABASE...
			</div>
			
			<!-- Mobile Identity Section -->
			<div class="block">
				<button
				type="button"
				class="w-full flex items-center justify-between terminal-button px-4 py-3 rounded-md mb-2 terminal-font text-sm"
				onclick={() => showIdentitySection = !showIdentitySection}
				>
				<span class="text-terminal-green font-bold">IDENTITY & PROJECT INFO</span>
				<span class="text-terminal-green transform transition-transform {showIdentitySection ? 'rotate-90' : ''}">▶</span>
			</button>
			{#if showIdentitySection}
					<p class="glitch-text-slow">
						<stropng>Hi - I'm a <strong class="text-terminal-green">cross-paradigm systems architect</strong> and
						<strong class="text-neon-purple">pattern-recognition specialist</strong> named
						<span class="font-bold text-rick-cyan terminal-font"
							><a
								href="{$identityRevealed ? 'https://www.linkedin.com/in/abramflansburg/' : '/'}#"
								target="_blank"
								rel="noopener noreferrer"
								class="{$identityRevealed ? 'hover:underline hover:text-portal-orange' : 'glitching-text text-terminal-red'}"
								data-text="{$identityRevealed ? myName : 'ᛒᛏᛈᚹᚱᚨᚦᚢᚠ'}">{$identityRevealed ? myName : 'ᛒᛏᛈᚹᚱᚨᚦᚢᚠ'}</a
							>.</span
						>
					</p>
					<div class="flex justify-center">
						<button
						class="{$identityRevealed ? 'terminal-button-disabled' : 'terminal-button text-terminal-green cursor-pointer'} px-4 py-2 my-4 rounded-md relative font-bold "
						onclick={() => {
							if (!$identityRevealed) {
								revealIdentity();
							}
						}}
						disabled={$identityRevealed}
						>
						{#if $identityRevealed}
							> NOT_ACCESSIBLE
						{:else}
							> REVEAL_IDENTITY
						{/if}
						</button>
					</div>
					<div class="space-y-2 mb-3 animate-slide-up">
						<p>This is my <em>Rick & Morty</em> themed <strong class="text-terminal-green">interdimensional portfolio terminal</strong>.</p>
						<p>
							Built using <span class="font-bold text-portal-orange terminal-font"
								><a href="https://kit.svelte.dev/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-terminal-green">SvelteKit</a
								></span
							>,
							<span class="font-bold text-terminal-blue terminal-font"
								><a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-neon-purple">TailwindCSS</a
								></span
							>, and a dash of <em class="text-rick-cyan">"AI"</em> <span class="text-xs opacity-60">(Large Language Model)</span>.
						</p>
						<p>
							<span class="animate-glow flex items-center gap-2 font-bold text-terminal-green">
								> SOURCE CODE REPOSITORY: <a
									href="https://github.com/aflansburg/consultme"
									target="_blank"
									rel="noopener noreferrer"
									class="text-rick-cyan hover:underline hover:text-portal-orange terminal-font"
								>
									<GitHubIcon />
								</a>
							</span>
						</p>
					</div>
				{/if}
			</div>

			<!-- Desktop Identity Section (always visible) -->
			<div class="hidden block space-y-2">
				<p>This is my <em>(mostly functional)</em> <strong class="text-terminal-green">interdimensional portfolio terminal</strong>.</p>
				<p>
					Built using <span class="font-bold text-portal-orange terminal-font"
						><a href="https://kit.svelte.dev/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-terminal-green">SvelteKit</a
						></span
					>,
					<span class="font-bold text-terminal-blue terminal-font"
						><a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" class="hover:underline hover:text-neon-purple">TailwindCSS</a
						></span
					>, and a dash of <em class="text-rick-cyan">"AI"</em> <span class="text-xs opacity-60">(Large Language Model)</span>.
				</p>
				<p>
					<span class="animate-glow flex items-center gap-2 font-bold text-terminal-green">
						> SOURCE CODE REPOSITORY: <a
							href="https://github.com/aflansburg/consultme"
							target="_blank"
							rel="noopener noreferrer"
							class="text-rick-cyan hover:underline hover:text-portal-orange terminal-font"
						>
							<GitHubIcon />
						</a>
					</span>
				</p>
			</div>
			<!-- Mobile Architecture Section -->
			<div class="block sm:hidden">
				<button
					type="button"
					class="w-full flex items-center justify-between terminal-button px-4 py-3 rounded-md mb-2 terminal-font text-sm"
					onclick={() => showArchitectureSection = !showArchitectureSection}
				>
					<span class="text-terminal-green font-bold">SYSTEM ARCHITECTURE</span>
					<span class="text-terminal-green transform transition-transform {showArchitectureSection ? 'rotate-90' : ''}">▶</span>
				</button>
				{#if showArchitectureSection}
					<div class="animate-slide-up mb-4">
						<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 terminal-font text-xs">
							<div class="text-terminal-green font-bold text-center mb-2">SYSTEM ARCHITECTURE</div>
							<div class="text-terminal-green/80">
								<div>• SvelteKit Frontend</div>
								<div>• Playwright Web Scraper</div>
								<div>• OpenAI GPT-4 Integration</div>
								<div>• Rick & Morty API Consumer</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
			<!-- Desktop System Architecture -->
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-2 hidden sm:block terminal-font text-xs">
				<div class="text-terminal-green font-bold text-center mb-2">SYSTEM ARCHITECTURE</div>
				<div class="text-terminal-green/80 space-y-0.5 text-xs">
					<div>• SvelteKit Frontend</div>
					<div>• Playwright Web Scraper</div>
					<div>• OpenAI GPT-4 Integration</div>
					<div>• Rick & Morty API Consumer</div>
				</div>
			</div>

			<!-- Three.js Portal Animation -->
			<ThreeJsPortal />
		</div>

		<div class="space-y-3 sm:space-y-4 lg:flex lg:items-start lg:justify-center">
			<div class="w-full max-w-3xl">
				<!-- Mobile Header -->
				<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 mb-2 sm:mb-4 block sm:hidden terminal-font text-xs">
					<div class="text-terminal-green font-bold text-center mb-1">INTERDIMENSIONAL CHARACTER DATABASE</div>
					<div class="text-terminal-green font-bold text-center">ACCESS MODULE</div>
				</div>
				<!-- Desktop Header -->
				<div class="rounded-md border border-terminal-green/50 bg-black/20 px-6 py-3 mb-2 sm:mb-4 hidden sm:block terminal-font text-sm">
					<div class="text-terminal-green font-bold text-center">INTERDIMENSIONAL CHARACTER DATABASE ACCESS MODULE</div>
				</div>
				<p class="pb-4 text-left mb-4 sm:mb-2">
					> <strong class="text-terminal-green">SYSTEM FUNCTION:</strong> Random entity data retrieval from multiverse personnel database
				</p>
				<p class="pb-3 sm:pb-2 text-left mb-3 sm:mb-2">
					<span class="text-terminal-blue">DATA ENHANCEMENT PROTOCOL:</span> Integrated web scraping subsystem deployed
				</p>
				<p class="pb-3 sm:pb-2 text-left mb-3 sm:mb-2">
					<span class="text-neon-purple">SCRAPING ENGINE:</span> Playwright-based Chromium automation targets
					Rick & Morty Fandom Wiki for supplemental intelligence gathering
				</p>
				<p class="pb-3 sm:pb-2 text-left mb-3 sm:mb-2">
					<span class="text-portal-orange">AI ANALYSIS:</span> Raw data processed through GPT-4 neural network
					for coherent information synthesis
				</p>
				<div class="py-2 sm:py-3 border-t border-terminal-green/20 mt-2 sm:mt-2">
					<div class="flex items-center gap-2 sm:gap-4">
						<p class="text-sm">
							<span class="text-terminal-blue">REROLL FUNCTION:</span> Fetch new entity from
							<span class="font-bold text-rick-cyan terminal-font"
								><a href="https://rickandmortyapi.com/" target="_blank" class="hover:underline hover:text-portal-orange"
								rel="noopener noreferrer"
									>Rick & Morty API</a
								></span
							> database
						</p>
					</div>
				</div>
				<div class="py-2 sm:py-3 border-t border-terminal-green/20 mt-2 sm:mt-2">
					<p class="text-xs text-terminal-green/70 italic">
						<span class="text-terminal-red">⚠ DISCLAIMER:</span> Apologies for any crude or untoward information displayed.
						All data is sourced directly from Citadel database systems - we have no control over entity records.
					</p>
				</div>
				<div class="w-full mt-4">
					{#if errorMessage}
						<div class="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/50">
							<div class="flex items-center gap-2 text-red-400">
								<span>⚠️</span>
								<span class="font-semibold">API Error:</span>
							</div>
							<p class="text-red-300 text-sm mt-1">{errorMessage}</p>
						</div>
					{/if}

					{#if data.error}
						<div class="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/50">
							<div class="flex items-center gap-2 text-yellow-400">
								<span>⚠️</span>
								<span class="font-semibold">Server Notice:</span>
							</div>
							<p class="text-yellow-300 text-sm mt-1">{data.error}</p>
						</div>
					{/if}

					{#key character.id}
						<div class="grid w-full grid-cols-1 items-start gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-2">
							<div class="flex flex-col items-center gap-3 sm:gap-4">
								<!-- Fixed size container to prevent layout shift -->
								<div class="relative w-full max-w-xs mx-auto aspect-square rounded-lg portal-border shadow-lg shadow-terminal-blue/20 overflow-hidden">
									<!-- Loading placeholder -->
									{#if characterLoading || !imageLoaded}
										<div class="absolute inset-0 bg-black/90 flex items-center justify-center">
											<div class="ascii-art text-center">
												<div class="animate-pulse text-terminal-green">
													{characterLoading ? 'LOADING CHARACTER...' : 'LOADING...'}
												</div>
												<div class="mt-2 text-xs opacity-60">
													{spinnerFrames[currentSpinnerFrame]}
												</div>
											</div>
										</div>
									{/if}
									<!-- Actual image or question mark placeholder -->
									{#if !characterLoading}
										{#if imageError}
											<div class="w-full h-full flex items-center justify-center bg-black/90 p-4">
												<span class="glitching-text text-terminal-red text-center text-sm font-mono leading-tight" data-text="Trouble fetching entity image from Citadel datastore.">Trouble fetching entity image from Citadel datastore.</span>
											</div>
										{:else}
											<img
												src={character.image}
												alt={character.name}
												class="w-full h-full object-cover transition-opacity duration-300 {imageLoaded ? 'opacity-100' : 'opacity-0'}"
												onload={() => { imageLoaded = true; }}
												onerror={() => { imageError = true; imageLoaded = true; }}
											/>
										{/if}
									{/if}
								</div>
								<div class="flex items-center justify-center gap-2">
									<button
										class="{characterLoading ? 'terminal-button-disabled' : 'terminal-button'} px-6 py-3 rounded-md relative font-bold"
										onclick={() => {
											if (!characterLoading) {
												fetchRandomCharacter();
											}
										}}
										disabled={characterLoading}
									>
										{characterLoading ? '> LOADING...' : '> REROLL_ENTITY'}
									</button>
									<button
										class="{showSearchInput ? 'terminal-button-disabled' : 'terminal-button'} px-3 py-3 rounded-md relative"
										onclick={() => {
											showSearchInput = !showSearchInput;
											if (!showSearchInput) {
												searchMessage = '';
												searchResults = [];
											}
										}}
										title={showSearchInput ? 'Close search' : 'Search for a character'}
									>
										{#if showSearchInput}
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
											</svg>
										{:else}
											<SearchIcon className="size-5" />
										{/if}
									</button>
								</div>
								{#if showSearchInput}
									{#if searchMessage}
										<div class="w-full max-w-xs text-center terminal-font text-xs {searchMessage.includes('NOT FOUND') ? 'text-terminal-red' : 'text-terminal-green'} opacity-80">
											{searchMessage}
										</div>
									{/if}
									<div class="flex gap-2 w-full max-w-xs">
										<input
											type="text"
											bind:value={searchQuery}
											placeholder="Entity name..."
											class="flex-1 px-3 py-2 rounded-md bg-black/90 border border-terminal-green/50 text-terminal-green terminal-font text-sm focus:outline-none focus:border-terminal-green"
											onkeydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
										/>
										<button
											class="{searchLoading ? 'terminal-button-disabled' : 'terminal-button'} px-4 py-2 rounded-md terminal-font"
											onclick={handleSearch}
											disabled={searchLoading}
										>
											<span style="font-size: 1.5rem;">
												{searchLoading ? '...' : '\u23CE'}
											</span>
										</button>
									</div>
									{#if searchResults.length > 1}
										<div class="w-full max-w-xs rounded-md terminal-border bg-black/95 overflow-hidden max-h-48 overflow-y-auto">
											{#each searchResults as result}
												<button
													class="w-full px-3 py-2 text-left terminal-font text-xs text-terminal-green hover:bg-terminal-green/10 transition-colors duration-150 border-b border-terminal-green/20 last:border-b-0"
													onclick={() => selectSearchResult(result)}
												>
													{result.name} <span class="opacity-60">({result.status} • {result.species})</span>
												</button>
											{/each}
										</div>
									{/if}
								{/if}
							</div>
							<dl
								class="grid w-full overflow-hidden rounded-md terminal-border bg-black/95 p-3 terminal-font text-sm backdrop-blur-sm sm:p-4 sm:text-base md:p-6 md:text-lg"
							>
								<div class="rounded-md border border-terminal-green/50 bg-black/20 px-2 py-1 mb-2 text-xs terminal-font">
									<div class="text-terminal-green font-bold text-center">ENTITY DATA • STATUS: ACTIVE</div>
								</div>
								<div
									class="grid auto-rows-auto grid-cols-1 gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3 sm:grid-cols-[minmax(auto,_max-content)_1fr] xl:grid-cols-1"
								>
									{#each Object.entries(character).filter(([key]) => !['id', 'image', 'url', 'created', 'episode', 'Additional Info'].includes(key)) as [key, value], i}
										<div
											class="contents sm:grid sm:grid-cols-[minmax(auto,_max-content)_1fr] sm:gap-x-4 xl:grid-cols-1"
										>
											<dt class="font-medium text-green-500/80 xl:mb-1">
												{key.charAt(0).toUpperCase() + key.slice(1)}:
											</dt>
											<dd
												class={`${key === 'status' && character.status === 'Deceased' ? 'text-red-500' : 'text-green-400'} break-words xl:pl-4`}
											>
												{#if typeof value === 'object'}
													{value.name}
												{:else}
													{value || 'Unknown'}
												{/if}
											</dd>
										</div>
									{/each}
								</div>
								<div class="mt-6 flex flex-col items-center">
									<dt class="mb-2 text-center font-medium text-green-500/80">Additional Info:</dt>
									<dd class="pr-2 text-center leading-relaxed text-green-400">
										<button
											onclick={toggleModal}
											class="inline-flex cursor-pointer items-center gap-2 rounded border border-green-500/30 bg-zinc-800 px-3 py-1.5 text-green-400 transition-all hover:border-green-500/50 hover:bg-zinc-700"
										>
											{#if fetchStarted && !aiResponse && !showModal}
												<span class="spinner inline-block text-white"
													>{spinnerFrames[currentSpinnerFrame]}</span
												>
											{:else if aiResponse}
												<span class="text-white"><GreenCheckIcon /></span>
											{:else}
												<span class="text-white"><ClickMeIcon /></span>
											{/if}
											<span>View</span>
										</button>
									</dd>
								</div>
							</dl>
						</div>
					{/key}
				</div>
			</div>
		</div>
	</div>

	<!-- Reboot Terminal Button -->
	<div class="flex justify-center mt-2 sm:mt-3">
		<button
			onclick={handleReboot}
			class="reboot-button px-3 py-1 mt-2 rounded-md terminal-font text-xs opacity-60 hover:opacity-100 transition-all duration-300"
			title="Reboot C-137-INFO Terminal"
		>
			> REBOOT_TERMINAL
		</button>
	</div>
</div>

<!-- C-137-INFO Terminal Modal -->
<CharacterInfoModal
	{showModal}
	{character}
	{loading}
	{aiResponse}
	{terminalLogs}
	{spinnerFrames}
	{currentSpinnerFrame}
	onClose={toggleModal}
/>

<style>
	.blink {
		animation: blink-animation 1s steps(2, start) infinite;
	}

	.spinner {
		width: 1em;
		margin-right: 0.5em;
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

	.animate-glow {
		animation: glow 2s ease-in-out infinite;
	}

	:global(.dark) .animate-glow {
		--glow-color: #67e8f9;
	}

	:global(.light) .animate-glow {
		--glow-color: #0e7490;
	}

	@keyframes blink-animation {
		to {
			visibility: hidden;
		}
	}

	.reboot-button {
		background: linear-gradient(45deg, #1a0a0a, #2a1010);
		border: 1px solid rgba(220, 38, 38, 0.3);
		color: rgba(248, 113, 113, 0.8);
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.reboot-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
		transition: left 0.5s ease;
	}

	.reboot-button:hover::before {
		left: 100%;
	}

	.reboot-button:hover {
		border-color: rgba(220, 38, 38, 0.6);
		box-shadow:
			0 0 10px rgba(220, 38, 38, 0.3),
			inset 0 0 10px rgba(220, 38, 38, 0.1);
		text-shadow: 0 0 8px rgba(248, 113, 113, 0.5);
		color: rgb(248, 113, 113);
	}

	/* Glitching text effect */
	.glitching-text {
		position: relative;
		display: inline-block;
		animation: glitch 2s infinite;
	}

	.glitching-text::before,
	.glitching-text::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.glitching-text::before {
		animation: glitch-1 0.5s infinite;
		color: #ff0000;
		z-index: -1;
	}

	.glitching-text::after {
		animation: glitch-2 0.5s infinite;
		color: #00ff00;
		z-index: -2;
	}

	@keyframes glitch {
		0%, 74%, 76%, 100% {
			transform: translate(0);
		}
		75% {
			transform: translate(-2px, 0);
		}
	}

	@keyframes glitch-1 {
		0%, 7%, 10%, 27%, 50%, 52%, 63%, 100% {
			transform: translate(0);
		}
		8%, 9% {
			transform: translate(-2px, -1px);
		}
		28%, 49% {
			transform: translate(-1px, 0);
		}
		51% {
			transform: translate(2px, 1px);
		}
		64% {
			transform: translate(-1px, -1px);
		}
	}

	@keyframes glitch-2 {
		0%, 15%, 22%, 36%, 62%, 67%, 100% {
			transform: translate(0);
		}
		16%, 21% {
			transform: translate(1px, 1px);
		}
		37%, 61% {
			transform: translate(-1px, 0);
		}
		68% {
			transform: translate(1px, -1px);
		}
	}

	/* Add data attribute support for glitch effect */
	.glitching-text[data-text]::before,
	.glitching-text[data-text]::after {
		content: attr(data-text);
	}
</style>
