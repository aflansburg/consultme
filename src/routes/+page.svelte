<script lang="ts">
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCharacter } from '$lib/rickandmorty/character';
	import { PUBLIC_MY_NAME } from '$env/static/public';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import ClickMeIcon from '$lib/icons/ClickMeIcon.svelte';
	import GreenCheckIcon from '$lib/icons/GreenCheckIcon.svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import TerminalBootSequence from '$lib/components/TerminalBootSequence.svelte';
	import { bootSequenceStore } from '$lib/stores/bootSequenceStore.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let aiResponse = $state('');
	let loading = $state(false);
	let fetchStarted = $state(false);
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = $state(0);
	let spinnerInterval: ReturnType<typeof setInterval>;
	const cannedAiErrorResponse = `<span class="text-red-500">Failed to load additional information.`;
	const myName = PUBLIC_MY_NAME;
	let showModal = $state(false);
	let imageLoaded = $state(false);

	async function fetchCharacterInfo() {
		loading = true;
		fetchStarted = true;
		aiResponse = '';
		try {
			const response = await fetch('/api/character-info', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					characterName: data.character.name
				})
			});
			const result = await response.json();
			if (result.error) {
				aiResponse = `${cannedAiErrorResponse}<br />Error:<br />${result.error}`;
			} else {
				aiResponse = result.info;
			}
		} catch (error) {
			aiResponse = `${cannedAiErrorResponse}\nError:\n${error}`;
		} finally {
			loading = false;
		}
	}

	async function fetchRandomCharacter() {
		aiResponse = '';
		fetchStarted = false;
		imageLoaded = false; // Reset image loaded state
		await invalidateAll();
	}

	async function fetchRickSanchez() {
		try {
			const rick = await getCharacter(1);
			data.character = rick;
			aiResponse = '';
			fetchStarted = false;
			imageLoaded = false; // Reset image loaded state
		} catch (error) {
			console.error('Failed to fetch Rick Sanchez:', error);
		}
	}

	// Add keyboard event handler for modal
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showModal) {
			toggleModal();
		}
	}

	onMount(() => {
		spinnerInterval = setInterval(() => {
			currentSpinnerFrame = (currentSpinnerFrame + 1) % spinnerFrames.length;
		}, 80);

		// Add keyboard event listener
		window.addEventListener('keydown', handleKeydown);

		// Reset image loaded state on initial load
		imageLoaded = false;

		return () => {
			clearInterval(spinnerInterval);
			window.removeEventListener('keydown', handleKeydown);
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

<svelte:head>
	<title>{$weirdWord} - C-137-INFO</title>
</svelte:head>

<TerminalBootSequence />

<div class="container mx-auto px-2 pt-2 sm:px-4 sm:pt-4">
	<div class="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
		<div class="space-y-3 sm:space-y-4">
			<div class="ascii-art mb-2 sm:mb-4">
> PERSONNEL FILE ACCESS INITIATED...
> SCANNING DIMENSION C-137 DATABASE...
			</div>
			<p class="glitch-text-slow">
				I'm not <span class="group relative">
					<button
						type="button"
						class="cursor-pointer border-none bg-transparent p-0 font-bold text-terminal-blue hover:text-portal-orange terminal-button"
						onclick={fetchRickSanchez}>Rick Sanchez</button
					>
					<span
						class="invisible absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs whitespace-nowrap text-green-400 group-hover:visible terminal-border"
					>
						Main character of Rick & Morty
					</span>
				</span> - obviously - I'm just a <strong class="text-terminal-green">cross-paradigm systems architect</strong> and
				<strong class="text-neon-purple">pattern-recognition specialist</strong> named
				<span class="font-bold text-rick-cyan terminal-font"
					><a
						href="https://www.linkedin.com/in/abramflansburg/"
						target="_blank"
						class="hover:underline hover:text-portal-orange">{myName}</a
					>.</span
				>
			</p>
			<p class="text-sm opacity-80">
				> Click the pulsating green question mark to reveal true identity parameters
			</p>
			<p>This is my <em>(mostly functional)</em> <strong class="text-terminal-green">interdimensional portfolio terminal</strong>.</p>
			<p>
				Built using <span class="font-bold text-portal-orange terminal-font"
					><a href="https://kit.svelte.dev/" target="_blank" class="hover:underline hover:text-terminal-green">SvelteKit</a
					></span
				>,
				<span class="font-bold text-terminal-blue terminal-font"
					><a href="https://tailwindcss.com/" target="_blank" class="hover:underline hover:text-neon-purple">TailwindCSS</a
					></span
				>, and a dash of <em class="text-rick-cyan">"AI"</em> <span class="text-xs opacity-60">(Large Language Model)</span>.
			</p>
			<p>
				<span class="animate-glow flex items-center gap-2 font-bold text-terminal-green">
					> SOURCE CODE REPOSITORY: <a
						href="https://github.com/aflansburg/consultme"
						target="_blank"
						class="text-rick-cyan hover:underline hover:text-portal-orange terminal-font"
					>
						<GitHubIcon />
					</a>
				</span>
			</p>
			<!-- Mobile System Architecture -->
			<div class="ascii-art block sm:hidden">
╔═════════════════════════════════════════╗
║             SYSTEM ARCHITECTURE         ║
║  • SvelteKit Frontend                   ║
║  • Playwright Web Scraper               ║
║  • OpenAI GPT-4 Integration             ║
║  • Rick & Morty API Consumer            ║
╚═════════════════════════════════════════╝
			</div>
			<!-- Desktop System Architecture -->
			<div class="ascii-art hidden sm:block">
╔════════════════════════════════════════════════════════╗
║  SYSTEM ARCHITECTURE: Microservices + Web Scraping     ║
║  - SvelteKit Frontend (This Interface)                 ║
║  - Playwright Web Scraper (Fandom Wiki Access)         ║
║  - OpenAI GPT-4 Integration (Character Analysis)       ║
║  - Rick & Morty API Consumer (Character Data)          ║
╚════════════════════════════════════════════════════════╝
			</div>
		</div>

		<div class="space-y-3 sm:space-y-4 lg:flex lg:items-start lg:justify-center">
			<div class="w-full max-w-3xl">
				<div class="ascii-art mb-2 sm:mb-4">
════════════════════════════════════════════════════════
   INTERDIMENSIONAL CHARACTER DATABASE ACCESS MODULE
════════════════════════════════════════════════════════
				</div>
				<p class="pb-4 text-left">
					> <strong class="text-terminal-green">SYSTEM FUNCTION:</strong> Random entity data retrieval from multiverse personnel database
				</p>
				<p class="pb-2 text-left">
					<span class="text-terminal-blue">DATA ENHANCEMENT PROTOCOL:</span> Integrated web scraping subsystem deployed
				</p>
				<p class="pb-2 text-left">
					<span class="text-neon-purple">SCRAPING ENGINE:</span> Playwright-based Chromium automation targets
					Rick & Morty Fandom Wiki for supplemental intelligence gathering
				</p>
				<p class="pb-2 text-left">
					<span class="text-portal-orange">AI ANALYSIS:</span> Raw data processed through GPT-4 neural network
					for coherent information synthesis
				</p>
				<div class="py-2 sm:py-4">
					<div class="flex items-center gap-2 sm:gap-4">
						<p class="text-sm">
							<span class="text-terminal-blue">REROLL FUNCTION:</span> Fetch new entity from
							<span class="font-bold text-rick-cyan terminal-font"
								><a href="https://rickandmortyapi.com/" target="_blank" class="hover:underline hover:text-portal-orange"
									>Rick & Morty API</a
								></span
							> database
						</p>
					</div>
				</div>
				<div class="w-full">
					{#key data.character.id}
						<div class="grid w-full grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-2">
							<div class="flex flex-col items-center gap-3 sm:gap-4">
								<!-- Fixed size container to prevent layout shift -->
								<div class="relative w-full max-w-sm aspect-square rounded-lg portal-border shadow-lg shadow-terminal-blue/20 overflow-hidden">
									<!-- Loading placeholder -->
									{#if !imageLoaded}
										<div class="absolute inset-0 bg-black/90 flex items-center justify-center">
											<div class="ascii-art text-center">
												<div class="animate-pulse text-terminal-green">
													LOADING...
												</div>
												<div class="mt-2 text-xs opacity-60">
													{spinnerFrames[currentSpinnerFrame]}
												</div>
											</div>
										</div>
									{/if}
									<!-- Actual image -->
									<img
										src={data.character.image}
										alt={data.character.name}
										class="w-full h-full object-cover transition-opacity duration-300 {imageLoaded ? 'opacity-100' : 'opacity-0'}"
										onload={() => { imageLoaded = true; }}
										onerror={() => { imageLoaded = true; }}
									/>
								</div>
								<button
									class="terminal-button px-6 py-3 rounded-md relative cursor-pointer font-bold"
									onclick={() => {
										fetchRandomCharacter();
									}}
								>
									> REROLL_ENTITY
								</button>
							</div>
							<dl
								class="grid w-full overflow-hidden rounded-md terminal-border bg-black/95 p-4 terminal-font text-base backdrop-blur-sm md:p-6 md:text-lg"
							>
								<div class="ascii-art text-xs mb-3">
╭─ ENTITY DATA READOUT ─╮
│ STATUS: ACTIVE        │
╰───────────────────────╯
								</div>
								<div
									class="grid auto-rows-auto grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[minmax(auto,_max-content)_1fr] xl:grid-cols-1"
								>
									{#each Object.entries(data.character).filter(([key]) => !['id', 'image', 'url', 'created', 'episode', 'Additional Info'].includes(key)) as [key, value], i}
										<div
											class="contents sm:grid sm:grid-cols-[minmax(auto,_max-content)_1fr] sm:gap-x-4 xl:grid-cols-1"
										>
											<dt class="font-medium text-green-500/80 xl:mb-1">
												{key.charAt(0).toUpperCase() + key.slice(1)}:
											</dt>
											<dd
												class={`${key === 'status' && data.character.status === 'Dead' ? 'text-red-500' : 'text-green-400'} break-words xl:pl-4`}
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
	<div class="flex justify-center mt-8 sm:mt-12">
		<button
			onclick={handleReboot}
			class="reboot-button px-4 py-2 rounded-md terminal-font text-xs opacity-60 hover:opacity-100 transition-all duration-300"
			title="Reboot C-137-INFO Terminal"
		>
			> REBOOT_TERMINAL
		</button>
	</div>
</div>

<!-- C-137-INFO Terminal Modal -->
{#if showModal}
	<div
		class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
	>
		<!-- Dense Matrix Data Stream Effect -->
		<div class="data-stream" style="left: 5%; animation-delay: 0s;">01001000 01100101 01101100 01110000</div>
		<div class="data-stream" style="left: 12%; animation-delay: 1.2s;">11010010 01001111 01010000</div>
		<div class="data-stream" style="left: 18%; animation-delay: 2s;">CITADEL_DATABASE_ACCESS</div>
		<div class="data-stream" style="left: 25%; animation-delay: 0.8s;">10110010 11001010 00111001</div>
		<div class="data-stream" style="left: 32%; animation-delay: 4s;">RICK_SANCHEZ_C137</div>
		<div class="data-stream" style="left: 38%; animation-delay: 1s;">01010010 01001001 01000011 01001011</div>
		<div class="data-stream" style="left: 45%; animation-delay: 3.5s;">MORTY_SMITH_PRIME</div>
		<div class="data-stream" style="left: 52%; animation-delay: 3s;">PORTAL_GUN_SIGNATURE</div>
		<div class="data-stream" style="left: 58%; animation-delay: 1.8s;">11100101 10010001 01110100</div>
		<div class="data-stream" style="left: 65%; animation-delay: 5s;">INTERDIMENSIONAL_TRAVEL</div>
		<div class="data-stream" style="left: 72%; animation-delay: 6s;">01000011 00110001 00110011 00110111</div>
		<div class="data-stream" style="left: 78%; animation-delay: 2.2s;">10001001 11010101 00101110</div>
		<div class="data-stream" style="left: 85%; animation-delay: 2.5s;">SCHWIFTY_PROTOCOL</div>
		<div class="data-stream" style="left: 92%; animation-delay: 4.5s;">WUBBA_LUBBA_DUB_DUB</div>
		<div class="data-stream" style="left: 8%; animation-delay: 3.2s;">DIMENSION_SCAN_ACTIVE</div>
		<div class="data-stream" style="left: 28%; animation-delay: 1.5s;">11001010 01110010 10101001</div>
		<div class="data-stream" style="left: 42%; animation-delay: 5.5s;">NEURAL_LINK_ESTABLISHED</div>
		<div class="data-stream" style="left: 68%; animation-delay: 0.5s;">01001101 01001111 01010010 01010100 01011001</div>
		<div class="data-stream" style="left: 88%; animation-delay: 3.8s;">QUANTUM_FLUX_DETECTED</div>
		<div class="data-stream" style="left: 15%; animation-delay: 4.2s;">00100000 11010011 10101010</div>

		<!-- Invisible button that covers the backdrop for keyboard accessibility -->
		<button
			class="absolute inset-0 h-full w-full cursor-default bg-transparent"
			onclick={toggleModal}
			aria-label="Close modal by clicking backdrop"
		></button>

		<div
			class="animate-slide-up relative z-10 w-full max-w-4xl rounded-lg terminal-border bg-black/98 p-6 terminal-font crt-screen"
			role="dialog"
			aria-labelledby="modal-title"
			aria-modal="true"
		>
			<button
				onclick={toggleModal}
				class="absolute top-4 right-4 cursor-pointer text-green-500/80 hover:text-green-500 focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:outline-none"
				aria-label="Close modal"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<div class="ascii-art text-xs mb-4">
╔═══════════════════════════════════════════════════════════════════════╗
║                        C-137-INFO DEEP ANALYSIS TERMINAL              ║
║                         CITADEL DATABASE ACCESS                       ║
╚═══════════════════════════════════════════════════════════════════════╝
			</div>
			<h2
				id="modal-title"
				class="mb-4 border-b border-terminal-green/50 pb-2 text-xl font-bold text-terminal-green sci-fi-header"
			>
				ENTITY PROFILE: {data.character.name.toUpperCase()}
			</h2>

			<div
				class="terminal-text max-h-[70vh] overflow-y-auto pr-2 terminal-font leading-relaxed text-terminal-green"
			>
				{#if loading}
					<div class="ascii-art text-xs mb-2">
> ACCESSING CITADEL DATABASES...
> SCRAPING FANDOM WIKI...
> PROCESSING NEURAL NETWORK...
					</div>
					<span class="glitch-text">
						<span class="spinner inline-block text-terminal-blue">{spinnerFrames[currentSpinnerFrame]}</span>
						<strong class="text-portal-orange">ANALYSIS IN PROGRESS...</strong>
					</span>
					{#if !aiResponse}
						<p class="mt-4 text-sm text-rick-cyan italic">
							> BACKGROUND PROCESSING ACTIVE: Modal can be closed - data will continue generating
						</p>
					{/if}
				{:else}
					<div class="ascii-art text-xs mb-2">
> DATA RETRIEVAL: COMPLETE
> ANALYSIS STATUS: PROCESSED
					</div>
					<span class="text-terminal-green">{@html aiResponse}</span>
					<br />
					<div class="mt-4 text-xs text-rick-cyan italic border-t border-terminal-green/30 pt-2">
						<strong>DISCLAIMER:</strong> Information accuracy varies across dimensional boundaries.
						Citadel databases may contain outdated or dimension-specific data.
						C-137-INFO system reliability: 94.7%
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

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

	/* Animation for modal */
	.animate-fade-in {
		animation: fadeIn 0.2s ease-out forwards;
	}

	.animate-slide-up {
		animation: slideUp 0.3s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.terminal-text {
		line-height: 1.6;
		padding: 1rem;
		border-radius: 0.25rem;
		background-color: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(34, 197, 94, 0.2);
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
</style>
