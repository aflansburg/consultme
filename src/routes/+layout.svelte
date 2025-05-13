<script lang="ts">
	import '../app.css';
	import SunIcon from '$lib/icons/SunIcon.svelte';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();
	let name = 'Rick Sanchez ?';
	let firstName = name.split(' ')[0] + ' ?';
	let avatarProperties = {
		src: 'rick_sanchez.jpg',
		alt: name,
		class:
			'w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-slate-50 shadow-lg cursor-pointer',
		style: 'object-fit: cover;',
		onclick: () => {
			goto('/');
		}
	};

	function toggleColorMode() {
		colorMode.toggle();
	}
</script>

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
	</div>
	<ul class="flex gap-3 text-sm sm:gap-6 sm:text-base">
		<li>
			<a href="/" class="font-medium transition-all hover:text-cyan-500">About</a>
		</li>
		<li>
			<a href="/contact" class="font-medium transition-all hover:text-cyan-500">Contact</a>
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
</style>
