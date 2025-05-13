<script lang="ts">
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCharacter } from '$lib/rickandmorty/character';
	import { PUBLIC_MY_NAME } from '$env/static/public';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import ClickMeIcon from '$lib/icons/ClickMeIcon.svelte';

	export let data: PageData;
	let aiResponse = '';
	let loading = false;
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = 0;
	let spinnerInterval: ReturnType<typeof setInterval>;
	const cannedAiErrorResponse = `<span class="text-red-500">Failed to load additional information.`;
	const myName = PUBLIC_MY_NAME;
	let showModal = false;

	const genTerminalAboutClass = () => {
		let classStr = '';

		if (loading) {
			classStr += 'text-green-500';
		} else {
			classStr += 'text-neutral-50';
		}

		return classStr;
	};

	async function fetchCharacterInfo() {
		loading = true;
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
		aiResponse = ''; // Reset the AI response for the new character
		await invalidateAll();
	}

	async function fetchRickSanchez() {
		try {
			const rick = await getCharacter(1);
			data.character = rick;
			fetchCharacterInfo();
		} catch (error) {
			console.error('Failed to fetch Rick Sanchez:', error);
		}
	}

	let name = 'Rick Sanchez';
	let overview = `
        $$$name$$$ is a scientist who is known for his crazy adventures and his ability to travel through time and space.
        <br />He is also known for his love of that sweet green juice and his tendency to get into trouble.
    `;

	let interpolatedFormatting = overview.replace(
		/\$\$\$name\$\$\$/g,
		`<span class='relative group inline-block'><span class='text-cyan-700 font-bold'>${name}</span><span class='invisible group-hover:visible absolute -top-20 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-md w-[300px] text-center leading-snug'>01100110 01101111 01101111 01100010 01100001 01110010</span></span>`
	);

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
</script>

<div class="container mx-auto px-4">
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
		<div class="space-y-4">
			<p>
				I'm not <span class="group relative">
					<button
						type="button"
						class="cursor-pointer border-none bg-transparent p-0 font-bold text-cyan-700 hover:underline"
						on:click={fetchRickSanchez}>Rick Sanchez</button
					>
					<span
						class="invisible absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-slate-800 px-2 py-1 text-sm whitespace-nowrap text-white group-hover:visible"
					>
						Main character of Rick & Morty
					</span>
				</span>, obviously - I'm a Jack-of-all-trades engineer named
				<span class="font-bold text-cyan-700"
					><a
						href="https://www.linkedin.com/in/abramflansburg/"
						target="_blank"
						class="hover:underline">{myName}</a
					></span
				>
			</p>
			<p>This is my portfolio slash consulting contact slash scheduling site ¯\_(ツ)_/¯.</p>
			<p>
				What you need to know about <span class="group relative">
					<span class="font-bold text-cyan-700">{name}</span>
					<span
						class="invisible absolute -top-20 left-1/2 w-[300px] -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-center text-sm leading-snug text-white group-hover:visible"
					>
						Ha! You probably thought when you hovered on this text that it would say something like
						"Main character of Rick & Morty" or something like that. Nah. Maybe I will another time.
					</span>
				</span>...
			</p>
			<p>{@html interpolatedFormatting}</p>
			<p>
				By the way, did you know that the color mode for this page is currently <span
					class={`${$colorMode === 'dark' ? 'text-neutral-50' : 'text-stone-950'} font-bold`}
					>{$colorMode}</span
				>?
			</p>
			<p>
				This is a pretty simple web application created with <span class="font-bold text-orange-600"
					><a href="https://kit.svelte.dev/" target="_blank" class="hover:underline">SvelteKit</a
					></span
				>
				and
				<span class="font-bold text-sky-600"
					><a href="https://tailwindcss.com/" target="_blank" class="hover:underline">TailwindCSS</a
					></span
				>.
			</p>
			<p>
				<span
					class="animate-glow flex items-center gap-2 font-bold {$colorMode === 'dark'
						? 'text-cyan-500'
						: 'text-cyan-700'}"
				>
					Here's the source if you're interested: <a
						href="https://github.com/aflansburg/consultme"
						target="_blank"
						class="{$colorMode === 'dark' ? 'text-white' : 'text-zinc-800'} hover:underline"
					>
						<GitHubIcon />
					</a>
				</span>
			</p>
			<p>
				It communicates with a Python <span class="font-bold text-teal-600"
					><a href="https://fastapi.tiangolo.com/" target="_blank" class="hover:underline"
						>FastAPI</a
					></span
				>
				backend.
			</p>
		</div>

		<div class="space-y-4 lg:flex lg:items-start lg:justify-center">
			<div class="w-full max-w-3xl">
				<p class="text-left">Anyways, here's a random Rick & Morty Character.</p>
				<p class="text-left">An LLM generates the additional information for each character.</p>
				<div class="py-4">
					<div class="flex items-center gap-4">
						<p>
							You can click the reroll button to fetch a new random character from the
							<span class="font-bold text-cyan-700"
								><a href="https://rickandmortyapi.com/" target="_blank" class="hover:underline"
									>Rick & Morty API</a
								></span
							>
						</p>
					</div>
				</div>
				<div class="w-full">
					{#key data.character.id}
						<p class="pb-8 text-center text-2xl font-bold md:text-3xl xl:col-span-2 xl:mb-0">
							{data.character.name}
						</p>
						<div class="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-2">
							<div class="flex flex-col items-center gap-4">
								<img
									src={data.character.image}
									alt={data.character.name}
									class="w-full max-w-sm rounded-lg border-2 border-green-500/30 shadow-lg"
								/>
								<button
									class="pulse-animation glow-border relative cursor-pointer rounded-md bg-zinc-700 px-4 py-2 text-white hover:bg-lime-400"
									on:click={() => {
										fetchRandomCharacter();
									}}
								>
									reroll
								</button>
							</div>
							<dl
								class="grid w-full overflow-hidden rounded-md border-2 border-green-500/30 bg-black/90 p-4 font-mono text-base shadow-[0_0_15px_rgba(34,197,94,0.2)] backdrop-blur-sm md:p-6 md:text-lg"
							>
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
											on:click={toggleModal}
											class="inline-flex items-center gap-2 rounded border border-green-500/30 bg-zinc-800 px-3 py-1.5 text-green-400 transition-all hover:border-green-500/50 hover:bg-zinc-700"
										>
											<span class="text-white"><ClickMeIcon /></span>
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
</div>

<!-- Terminal Modal -->
{#if showModal}
	<div
		class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		on:click={toggleModal}
	>
		<div
			class="animate-slide-up relative w-full max-w-3xl rounded-lg border-2 border-green-500/50 bg-black/95 p-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
			on:click|stopPropagation
		>
			<button
				on:click={toggleModal}
				class="absolute top-4 right-4 text-green-500/80 hover:text-green-500"
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

			<h2 class="mb-4 border-b border-green-500/30 pb-2 text-xl font-bold text-green-500/80">
				Additional Information: {data.character.name}
			</h2>

			<div
				class="terminal-text max-h-[70vh] overflow-y-auto pr-2 font-mono leading-relaxed text-green-400"
			>
				{#if loading}
					<span>
						<span class="spinner inline-block">{spinnerFrames[currentSpinnerFrame]}</span>
						Fetching additional information...
					</span>
				{:else}
					<span>{@html aiResponse}</span>
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

	.pulse-animation {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.glow-border {
		box-shadow:
			0 0 5px #22c55e,
			0 0 10px #22c55e,
			0 0 15px #22c55e;
		border: 2px solid rgba(34, 197, 94, 0.5);
		transition: all 0.3s ease;
	}

	.glow-border:hover {
		box-shadow:
			0 0 10px #22c55e,
			0 0 20px #22c55e,
			0 0 30px #22c55e;
		border-color: rgba(34, 197, 94, 0.8);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.9;
			transform: scale(1.05);
		}
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
</style>
