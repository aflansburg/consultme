<script lang="ts">
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCharacter } from '$lib/rickandmorty/character';
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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let character = $state(data.character);
	let aiResponse = $state('');
	let loading = $state(false);
	let fetchStarted = $state(false);
	let characterLoading = $state(true);
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
	let logsContainer = $state<HTMLDivElement | undefined>();

	async function fetchCharacterInfo() {
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
				})
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
								// Auto-scroll to bottom
								setTimeout(() => {
									if (logsContainer) {
										logsContainer.scrollTop = logsContainer.scrollHeight;
									}
								}, 50);
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
		} catch (error) {
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
						I'm not <span class="group relative">
							<button
								type="button"
								class="cursor-pointer border-none bg-transparent p-1 font-bold text-terminal-blue hover:text-portal-orange terminal-button"
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
								href="{$identityRevealed ? 'https://www.linkedin.com/in/abramflansburg/' : '/'}#"
								target="_blank"
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
					</div>
				{/if}
			</div>

			<!-- Desktop Identity Section (always visible) -->
			<div class="hidden block space-y-2">
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
{#if showModal}
	<div
		class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
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
			class="animate-slide-up relative z-10 w-full max-w-4xl rounded-lg terminal-border bg-black/98 p-4 sm:p-6 terminal-font crt-screen max-h-[90vh] overflow-hidden"
			role="dialog"
			aria-labelledby="modal-title"
			aria-modal="true"
		>
			<!-- Terminal-style close button - integrated with border -->
			<button
				onclick={toggleModal}
				class="absolute top-0 left-0 w-8 h-8 bg-black/90 hover:bg-black transition-all duration-200 flex items-center justify-center cursor-pointer focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:outline-none group border-r border-b border-terminal-green/30"
				aria-label="Close modal"
				title="Close terminal"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-terminal-green group-hover:text-green-400"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-6 py-4 hidden sm:block text-center mb-4 terminal-font text-sm">
				<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO DEEP ANALYSIS TERMINAL</div>
				<div class="text-terminal-green font-bold text-center">CITADEL DATABASE ACCESS</div>
			</div>
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 block sm:hidden text-center mb-4 terminal-font text-xs">
				<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO TERMINAL</div>
				<div class="text-terminal-green font-bold text-center">DATABASE ACCESS</div>
			</div>
			<h2
				id="modal-title"
				class="mb-4 border-b border-terminal-green/50 pb-2 text-xl font-bold text-terminal-green sci-fi-header"
			>
				ENTITY PROFILE: {character.name.toUpperCase()}
			</h2>

			<div
				class="terminal-text max-h-[70vh] overflow-y-auto pr-2 terminal-font leading-relaxed text-terminal-green"
			>
				{#if loading}
					<div class="rounded-md border border-terminal-green/50 bg-black/20 px-3 py-2 mb-4 text-xs terminal-font">
						<div class="text-terminal-green font-bold mb-1">REAL-TIME TERMINAL OUTPUT</div>
						<div class="text-terminal-green/80">STATUS: PROCESSING</div>
					</div>

					<!-- Terminal logs section -->
					<div bind:this={logsContainer} class="terminal-logs-container mb-4 max-h-40 overflow-y-auto bg-black/50 p-3 rounded border border-terminal-green/30">
						{#each terminalLogs as log}
							<div class="terminal-log-line text-xs text-terminal-green font-mono">
								<span>{log}</span>
							</div>
						{/each}
						{#if terminalLogs.length === 0}
							<div class="terminal-log-line text-xs text-terminal-green/60 font-mono">
								<span class="opacity-60">[{new Date().toLocaleTimeString()}]</span>
								<span class="ml-2">> INITIALIZING_SYSTEM...</span>
							</div>
						{/if}
					</div>

					<span class="glitch-text">
						<span class="spinner inline-block text-terminal-blue">{spinnerFrames[currentSpinnerFrame]}</span>
						<strong class="text-portal-orange">DEEP ANALYSIS IN PROGRESS...</strong>
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
					<pre class="text-terminal-green whitespace-pre-wrap font-mono text-sm leading-relaxed">{aiResponse}</pre>
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

	/* Terminal logs styling */
	.terminal-logs-container {
		scrollbar-width: thin;
		scrollbar-color: var(--terminal-green) transparent;
	}

	.terminal-logs-container::-webkit-scrollbar {
		width: 4px;
	}

	.terminal-logs-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.terminal-logs-container::-webkit-scrollbar-thumb {
		background: var(--terminal-green);
		border-radius: 2px;
	}

	.terminal-log-line {
		animation: terminal-log-appear 0.3s ease-out;
		padding: 1px 0;
	}

	@keyframes terminal-log-appear {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* AI Response formatting */
	.terminal-text pre {
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1.4;
		overflow-x: auto;
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
