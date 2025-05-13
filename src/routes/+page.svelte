<script lang="ts">
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getCharacter } from '$lib/rickandmorty/character';
	import { PUBLIC_MY_NAME } from '$env/static/public';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';

	export let data: PageData;
	let aiResponse = '';
	let loading = true;
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = 0;
	let spinnerInterval: ReturnType<typeof setInterval>;
	const cannedAiErrorResponse = `<span class="text-red-500">Failed to load additional information.`;
	const myName = PUBLIC_MY_NAME;

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
		await invalidateAll();
		await fetchCharacterInfo();
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

	onMount(() => {
		spinnerInterval = setInterval(() => {
			currentSpinnerFrame = (currentSpinnerFrame + 1) % spinnerFrames.length;
		}, 80);

		fetchCharacterInfo();

		return () => {
			clearInterval(spinnerInterval);
		};
	});
</script>

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
		><a href="https://www.linkedin.com/in/abramflansburg/" target="_blank" class="hover:underline"
			>{myName}</a
		></span
	>
</p>
<br />
<p>This is my portfolio slash consulting contact slash scheduling site ¯\_(ツ)_/¯.</p>
<br />
<p>
	What you need to know about <span class="group relative">
		<span class="font-bold text-cyan-700">{name}</span>
		<span
			class="invisible absolute -top-20 left-1/2 w-[300px] -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-center text-sm leading-snug text-white group-hover:visible"
		>
			Ha! You probably thought when you hovered on this text that it would say something like "Main
			character of Rick & Morty" or something like that. Nah. Maybe I will another time.
		</span>
	</span>...
</p>
<br />
<p>{@html interpolatedFormatting}</p>
<br />
<p>
	By the way, did you know that the color mode for this page is currently <span
		class={`${$colorMode === 'dark' ? 'text-neutral-50' : 'text-stone-950'} font-bold`}
		>{$colorMode}</span
	>?
</p>
<br />
<p>
	This is a pretty simple web application created with <span class="font-bold text-orange-600"
		><a href="https://kit.svelte.dev/" target="_blank" class="hover:underline">SvelteKit</a></span
	>
	and
	<span class="font-bold text-sky-600"
		><a href="https://tailwindcss.com/" target="_blank" class="hover:underline">TailwindCSS</a
		></span
	>.
</p>
<br />
<p>
	<span class="flex items-center gap-2 font-bold text-cyan-500">
		Here's the source if you're interested: <a
			href="https://github.com/aflansburg/consultme"
			target="_blank"
			class="text-white hover:underline"
		>
			<GitHubIcon />
		</a>
	</span>
</p>
<br />
<p>
	It communicates with a Python <span class="font-bold text-teal-600"
		><a href="https://fastapi.tiangolo.com/" target="_blank" class="hover:underline">FastAPI</a
		></span
	>
	backend.
</p>
<br />
<p class="text-left">Anyways, here's a random Rick & Morty Character.</p>
<p class="text-left">An LLM generates the additional information for each character.</p>
<div class="py-4">
	<div class="flex items-center gap-4">
		<p>
			You can click this button to fetch a new random character from the
			<span class="font-bold text-cyan-700"
				><a href="https://rickandmortyapi.com/" target="_blank" class="hover:underline"
					>Rick & Morty API</a
				></span
			>
		</p>
	</div>
	<div class="py-4">
		<button
			class="pulse-animation glow-border relative cursor-pointer cursor-pointer rounded-md bg-zinc-700 px-4 py-2 text-white hover:bg-lime-400"
			on:click={() => {
				fetchRandomCharacter();
			}}
		>
			reroll
		</button>
	</div>
</div>
<div
	class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 md:max-w-5xl lg:max-w-6xl"
>
	{#key data.character.id}
		<p class="text-center text-2xl font-bold md:text-3xl">{data.character.name}</p>
		<div class="grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2">
			<img
				src={data.character.image}
				alt={data.character.name}
				class="mx-auto w-full max-w-sm rounded-lg border-2 border-green-500/30 shadow-lg"
			/>
			<dl
				class="grid w-full overflow-hidden rounded-md border-2 border-green-500/30 bg-black/90 p-4 font-mono text-base shadow-[0_0_15px_rgba(34,197,94,0.2)] backdrop-blur-sm md:p-6 md:text-lg"
			>
				<div
					class="grid grid-cols-[minmax(auto,_max-content)_1fr] gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-2"
				>
					{#each Object.entries(data.character).filter(([key]) => !['id', 'image', 'url', 'created', 'episode', 'Additional Info'].includes(key)) as [key, value], i}
						<div class="contents md:grid md:grid-cols-[minmax(auto,_max-content)_1fr] md:gap-x-4">
							<dt class="font-medium whitespace-nowrap text-green-500/80">
								{key.charAt(0).toUpperCase() + key.slice(1)}:
							</dt>
							<dd
								class={`${key === 'status' && data.character.status === 'Dead' ? 'text-red-500' : 'text-green-400'} break-words`}
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
				<div class="mt-6">
					<dt class="mb-2 font-medium text-green-500/80">Additional Info:</dt>
					<dd class={`leading-relaxed ${genTerminalAboutClass()} pr-2`}>
						{#if loading}
							<span>
								<span class="spinner inline-block">{spinnerFrames[currentSpinnerFrame]}</span>
								Fetching additional information...
							</span>
						{:else}
							<span>{@html aiResponse}</span>
						{/if}
					</dd>
				</div>
			</dl>
		</div>
	{/key}
</div>

<style>
	.blink {
		animation: blink-animation 1s steps(2, start) infinite;
	}

	.spinner {
		width: 1em;
		margin-right: 0.5em;
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
</style>
