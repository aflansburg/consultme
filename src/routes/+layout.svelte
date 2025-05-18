<script lang="ts">
	import '../app.css';
	import SunIcon from '$lib/icons/SunIcon.svelte';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import QuestionMarkIcon from '$lib/icons/QuestionMarkIcon.svelte';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import { avatarImage } from '$lib/stores/avatarImage.svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { errorMessage } from '$lib/stores/errorMessageStore.svelte';
	import { PUBLIC_AVATAR_IMG_PATH, PUBLIC_MY_NAME } from '$env/static/public';
	import { goto } from '$app/navigation';

	let { children } = $props();
	let name = $state('Rick Sanchez');
	let firstName = $derived(name.split(' ')[0]);
	let showQuestionMark = $state(true);
	let avatarProperties = $derived({
		src: $avatarImage,
		alt: name,
		class:
			'w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-slate-50 shadow-lg cursor-pointer',
		style: 'object-fit: cover;',
		onclick: () => {
			goto('/');
		}
	});

	function toggleColorMode() {
		colorMode.toggle();
	}
</script>

<svelte:head>
	<title>{$weirdWord}</title>
</svelte:head>

<div class={$colorMode}>
	<nav
		class="relative flex items-center justify-between px-4 py-3 {$colorMode === 'dark'
			? 'border-b border-zinc-700 bg-zinc-900 text-zinc-50'
			: 'border-b border-zinc-200 bg-white text-zinc-800'} shadow-lg backdrop-blur-sm"
	>
		<div class="absolute -bottom-6 left-4">
			<img {...avatarProperties} />
		</div>
		<div class="ml-[4.5rem] truncate pl-4 text-lg font-bold tracking-wide sm:ml-20 sm:text-xl">
			<span class="xs:inline hidden">{name}</span>
			<span class="xs:hidden inline">{firstName}</span>
			{#if showQuestionMark}
				<button
					type="button"
					class="relative ml-1 inline-flex cursor-pointer items-center border-none bg-transparent p-0 align-middle text-green-500 hover:text-green-400 focus:outline-none"
					style="vertical-align: middle; position: relative; top: -1px;"
					onclick={() => {
						avatarImage.set('/' + PUBLIC_AVATAR_IMG_PATH);
						name = PUBLIC_MY_NAME;
						firstName = PUBLIC_MY_NAME.split(' ')[0];
						showQuestionMark = false;
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							avatarImage.set('/' + PUBLIC_AVATAR_IMG_PATH);
							name = PUBLIC_MY_NAME;
							firstName = PUBLIC_MY_NAME.split(' ')[0];
							showQuestionMark = false;
						}
					}}
					aria-label="Reset identity"
				>
					<QuestionMarkIcon className="pulse-svg cursor-pointer" />
				</button>
			{/if}
		</div>
		<ul class="flex gap-3 text-sm sm:gap-6 sm:text-base">
			<li>
				<a href="/" class="font-medium transition-all hover:text-cyan-500">About</a>
			</li>
			<li>
				<a href="/projects" class="font-medium transition-all hover:text-cyan-500">Projects</a>
			</li>
			<li>
				<a href="/contact" class="font-medium transition-all hover:text-cyan-500">Contact</a>
			</li>
			<li>
				<a
					href="/this-route-def-does-not-exist"
					class="font-medium transition-all hover:text-red-500">Whoops</a
				>
			</li>
			<li>
				<a
					href="https://github.com/aflansburg"
					target="_blank"
					rel="noopener noreferrer"
					class="flex cursor-pointer transition-all hover:text-cyan-500"
					aria-label="GitHub Profile"
				>
					<GitHubIcon />
				</a>
			</li>
			<li>
				<button
					class="cursor-pointer transition-all hover:text-cyan-500"
					aria-label="Toggle theme"
					onclick={toggleColorMode}><SunIcon /></button
				>
			</li>
		</ul>
	</nav>

	<div
		class="min-h-screen px-8 pt-14 pb-24 sm:pt-16 sm:pb-32 md:pt-16 md:pb-32 lg:pt-20 lg:pb-36 {$colorMode ===
		'dark'
			? 'bg-zinc-900 text-zinc-50'
			: 'bg-zinc-50'}"
	>
		{@render children()}
	</div>
</div>

<style>
	@media (min-width: 420px) {
		:global(.xs\:inline) {
			display: inline;
		}
		:global(.xs\:hidden) {
			display: none;
		}
	}

	@keyframes glow {
		0%,
		100% {
			text-shadow: 0 0 0px #22c55e;
		}
		50% {
			text-shadow: 0 0 15px #22c55e;
		}
	}

	.animate-glow {
		animation: glow 2s ease-in-out infinite;
	}

	:global(.pulse-animation) {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	:global(.pulse-svg) {
		filter: drop-shadow(0 0 2px #22c55e);
		animation: pulse-svg 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse-svg {
		0%,
		100% {
			filter: drop-shadow(0 0 1px #22c55e);
			transform: scale(1);
		}
		50% {
			filter: drop-shadow(0 0 4px #22c55e);
			transform: scale(1.25);
		}
	}

	:global(.glow-border) {
		box-shadow:
			0 0 5px #22c55e,
			0 0 10px #22c55e,
			0 0 15px #22c55e;
		border: 2px solid rgba(34, 197, 94, 0.5);
		transition: all 0.3s ease;
	}

	:global(.glow-border:hover) {
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
			text-shadow: 0 0 5px #22c55e;
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
			text-shadow:
				0 0 15px #22c55e,
				0 0 20px #22c55e;
			color: #4ade80;
		}
	}
</style>
