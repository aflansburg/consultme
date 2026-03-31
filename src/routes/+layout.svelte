<script lang="ts">
	import '../app.css';
	import {
		SunIcon,
		MoonIcon,
		GitHubIcon,
		LinkedInIcon,
		QuestionMarkIcon,
		MenuIcon,
		CloseIcon,
		YouTubeIcon,
		SkullIcon,
		RickAndMortyIcon,
		MatrixLyrics
	} from '@aflansburg/terminal-ui';
	import YouTubeModal from '$lib/components/YouTubeModal.svelte';
	import ChangelogModal from '$lib/components/ChangelogModal.svelte';
	import MatrixRain from '$lib/components/MatrixRain.svelte';
	import MrFrundles from '$lib/components/MrFrundles.svelte';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import { avatarImage } from '$lib/stores/avatarImage.svelte';
	import { name, firstName, identityRevealed } from '$lib/stores/identity.svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { errorMessage } from '$lib/stores/errorMessageStore.svelte';
	import { PUBLIC_AVATAR_IMG_PATH, PUBLIC_MY_NAME } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { konamiDetector } from '$lib/utils/konamiCode';
	import { bootSequenceStore } from '$lib/stores/bootSequenceStore.svelte';

	let { children } = $props();
	let isMenuOpen = $state(false);
	let konamiActivated = $state(false);
	let screenGlitching = $state(false);
	let vhsGlitching = $state(false);
	let glitchCounter = $state(0); // Counter for 4:1 ratio
	let showYouTubeModal = $state(false);
	let currentVideoId = $state('');
	let showMatrixLyrics = $state(false);
	let currentLyrics = $state("");
	let lyricsMode = $state<"matrix" | "straight">("matrix");
	let lyricsTimer: ReturnType<typeof setTimeout>;
	let youtubeVideoId = $state('https://youtu.be/M1tIH55Bo8k?si=0TQ1EmMIrn4H631I&t=206'); // YouTube video with timestamp
	let rickAndMortyVideoId = $state('https://www.youtube.com/watch?v=i7RMgPHGSMU'); // Rick and Morty video
	let showChangelogModal = $state(false);
	let showMatrixRain = $state(false);
	let showFrundles = $state(false);
	let showGadgets = $state(false);
	let showMobileGadgets = $state(false);
	let avatarProperties = $derived({
		src: $avatarImage,
		alt: $name,
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

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
		if (!isMenuOpen) showMobileGadgets = false;
	}

	function openYouTubeModal(videoId: string) {
		currentVideoId = videoId;
		showYouTubeModal = true;

		// Clear any existing timer
		if (lyricsTimer) {
			clearTimeout(lyricsTimer);
		}
		showMatrixLyrics = false;

		// Check if this is the sad video (M1tIH55Bo8k)
		if (videoId.includes('M1tIH55Bo8k')) {
			currentLyrics = "Something kinda sad about The way that things have come to be Desensitized to everything What became of subtlety? How can this mean anything to me If I really don't feel anything at all?";
			lyricsMode = "matrix";
			// Start lyrics after 24 seconds
			lyricsTimer = setTimeout(() => {
				showMatrixLyrics = true;
				// Stop lyrics after 35 seconds
				setTimeout(() => {
					showMatrixLyrics = false;
				}, 35000);
			}, 24000);
		}
		// Check if this is the Rick and Morty video (i7RMgPHGSMU)
		else if (videoId.includes('i7RMgPHGSMU')) {
			currentLyrics = "Somewhere out on that horizon Out beyond the neon lights I know there must be something better But there's nowhere else in sight It's survival in the city When you live from day to day City streets don't have much pity When you're down, that's where you'll stay";
			lyricsMode = "straight";
			// Start lyrics right away with the video
			lyricsTimer = setTimeout(() => {
				showMatrixLyrics = true;
				// Stop lyrics after enough time for all lyrics (about 40 seconds)
				setTimeout(() => {
					showMatrixLyrics = false;
				}, 40000);
			}, 1000); // Start after 1 second
		}
	}

	function closeYouTubeModal() {
		showYouTubeModal = false;
		currentVideoId = '';

		// Clean up lyrics
		if (lyricsTimer) {
			clearTimeout(lyricsTimer);
		}
		showMatrixLyrics = false;
		currentLyrics = "";
		lyricsMode = "matrix";
	}

	function openChangelogModal() {
		showChangelogModal = true;
	}

	function closeChangelogModal() {
		showChangelogModal = false;
	}

	// Developer Console Easter Eggs
	if (typeof window !== 'undefined') {
		// Welcome message for developers
		console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    C-137-INFO SYSTEM                      ║
║           Welcome, fellow interdimensional dev!           ║
║                                                           ║
║  Try typing some commands:                                ║
║  • portal() - Open a portal to the source code            ║
║  • schwifty() - Get Schwifty status                       ║
║  • rick.getIQ() - Access Rick's intelligence level        ║
║  • morty.anxiety() - Check Morty's stress levels          ║
║  • resetBoot() - Reset boot sequence                      ║
║  • bootStatus() - Check boot sequence status              ║
║                                                           ║
║  Or try the Konami Code: ↑↑↓↓←→←→BA                       ║
╚═══════════════════════════════════════════════════════════╝
		`);

		// Developer console commands
		(window as any).portal = () => {
			console.log('🌀 Portal opened! https://github.com/aflansburg/consultme');
			window.open('https://github.com/aflansburg/consultme', '_blank');
		};

		(window as any).schwifty = () => {
			console.log('💫 Getting Schwifty! Current schwiftiness level: Over 9000!');
			return { schwiftiness: 'MAXIMUM', status: 'SCHWIFTY', pants: 'OFF' };
		};

		(window as any).rick = {
			getIQ: () => {
				console.log('🧠 Rick C-137 IQ: ∞ (Undefined due to interdimensional intelligence overflow)');
				return Infinity;
			}
		};

		(window as any).morty = {
			anxiety: () => {
				console.log('😰 Morty anxiety level: 98.7% - "Oh jeez, Rick!"');
				return { level: '98.7%', status: 'OH_JEEZ', phrase: 'Oh jeez, Rick!' };
			}
		};

		// Boot sequence control commands
		(window as any).resetBoot = () => {
			bootSequenceStore.reset();
			console.log('🔄 Boot sequence reset! Refresh the page to see it again.');
		};

		(window as any).bootStatus = () => {
			const shouldShow = bootSequenceStore.shouldShowBootSequence;
			console.log(`🛸 Boot sequence status: ${shouldShow ? 'WILL SHOW' : 'HIDDEN'}`);
			return { shouldShow, instructions: 'Use resetBoot() to show it again' };
		};

		// Random screen glitch function with 4:1 VHS to screen distortion ratio
		function triggerRandomGlitch() {
			if (!screenGlitching && !vhsGlitching) {
				glitchCounter = (glitchCounter + 1) % 5; // 0,1,2,3,4 then reset to 0

				// Use screen distortion every 5th glitch (when counter is 0)
				if (glitchCounter === 0) {
					screenGlitching = true;
					setTimeout(() => {
						screenGlitching = false;
					}, 600); // Match the screen glitch animation duration
				} else {
					// Use VHS glitch for counts 1,2,3,4
					vhsGlitching = true;
					setTimeout(() => {
						vhsGlitching = false;
					}, 1800); // Total duration including both scan lines (1.2s + 0.6s)
				}
			}
		}

		// Set up random glitch intervals (every 5-6 seconds)
		function setupRandomGlitches() {
			function scheduleNextGlitch() {
				const randomDelay = 5000 + Math.random() * 1000; // 5-6 seconds
				setTimeout(() => {
					triggerRandomGlitch();
					scheduleNextGlitch(); // Schedule the next one
				}, randomDelay);
			}
			scheduleNextGlitch();
		}

		// Start random glitches after a short delay
		setTimeout(setupRandomGlitches, 3000);

		// Konami Code Easter Egg
		if (konamiDetector) {
			konamiDetector.onKonamiCode(() => {
				konamiActivated = true;
				console.log('🛸 KONAMI CODE ACTIVATED! Portal Gun charged to 100%! 🛸');
				console.log('✨ Initiating interdimensional glitch sequence...');
				// Trigger glitch effect on the entire page
				document.body.classList.add('glitch-text');
				setTimeout(() => {
					document.body.classList.remove('glitch-text');
					konamiActivated = false;
					console.log('🎯 Glitch sequence complete. Reality restored.');
				}, 3000);
			});
		}
	}
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') showGadgets = false; }} />

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "Abe Flansburg | Solutions Architect & Musician",
		"url": "https://engabe.com",
		"description": "Portfolio of Abe Flansburg — Solutions Architect, AI Architect, Software Developer, and Musician based in Houston, TX."
	})}</script>`}
</svelte:head>

<div class="crt-screen {$colorMode}" class:screen-glitch={screenGlitching}>
	<nav
		class="relative flex items-center justify-between px-4 py-3 terminal-border {$colorMode === 'light'
			? 'bg-black/90 text-green-400'
			: 'bg-zinc-950/95 text-green-300'} shadow-lg backdrop-blur-sm"
	>
		<div class="absolute -bottom-6 left-4">
			<img {...avatarProperties} />
		</div>
		<div class="ml-[4.5rem] truncate pl-4 text-lg font-bold tracking-wide sm:ml-20 sm:text-xl">
			<div class="text-xs mb-1 terminal-font text-terminal-green/80 text-left sm:text-left">
				<div>C-137-INFO</div>
				<div>SYS_ID: {$weirdWord.toUpperCase()}</div>
			</div>
			<span class="xs:inline hidden terminal-font">{$name}</span>
			<span class="xs:hidden inline terminal-font">{$name}</span>
		</div>

		<!-- Mobile menu button -->
		<button
			class="z-20 cursor-pointer transition-all hover:text-cyan-500 md:hidden"
			aria-label="Toggle mobile menu"
			onclick={toggleMenu}
		>
			{#if isMenuOpen}
				<CloseIcon />
			{:else}
				<MenuIcon />
			{/if}
		</button>

		<!-- Desktop navigation -->
		<ul class="hidden gap-3 text-sm md:flex md:gap-6 md:text-base">
			<li>
				<a href="/about" class="font-medium transition-all hover:text-cyan-500">About Me</a>
			</li>
			<li>
				<a href="/work" class="font-medium transition-all hover:text-cyan-500">Work</a>
			</li>
			<li>
				<a href="/contact" class="font-medium transition-all hover:text-cyan-500">Contact</a>
			</li>
			<li>
				<a href="/transmissions" class="font-medium transition-all hover:text-cyan-500">Transmissions</a>
			</li>
			<li class="relative">
				<button
					class="flex items-center gap-1.5 font-medium terminal-font text-sm cursor-pointer transition-all hover:text-cyan-500 border border-green-500/50 rounded px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 hover:border-green-400"
					style="text-shadow: 0 0 8px rgba(0, 255, 65, 0.3);"
					aria-label="Open gadgets menu"
					onclick={() => showGadgets = !showGadgets}
				>
					<span class="text-green-400">&#9881;</span> Gadgets
				</button>

				{#if showGadgets}
					<!-- Click-outside overlay -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="fixed inset-0 z-40"
						onclick={() => showGadgets = false}
					></div>

					<div
						class="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border-2 border-green-500 bg-zinc-950/95 backdrop-blur-sm py-2"
						style="box-shadow: 0 0 20px rgba(0, 255, 65, 0.25), 0 0 40px rgba(0, 255, 65, 0.1);"
						role="menu"
					>
						<a
							href="/this-route-def-does-not-exist"
							class="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-red-500/10"
							onclick={() => showGadgets = false}
							role="menuitem"
						>
							<span class="text-red-500 text-lg font-bold" style="text-shadow: 0 0 10px #ef4444;">✗</span>
							<span class="text-red-400 terminal-font text-xs">Don't click this</span>
						</a>
						<button
							class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-green-500/10 cursor-pointer"
							onclick={() => { showMatrixRain = true; showGadgets = false; }}
							role="menuitem"
						>
							<span class="text-green-400 text-lg font-bold terminal-font" style="text-shadow: 0 0 10px #22c55e;">M</span>
							<span class="text-green-300 terminal-font text-xs">Enter the Matrix</span>
						</button>
						<button
							class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-yellow-500/10 cursor-pointer"
							onclick={() => { showFrundles = true; showGadgets = false; }}
							role="menuitem"
						>
							<span class="text-yellow-400 text-lg font-bold terminal-font" style="text-shadow: 0 0 10px #eab308;">!</span>
							<span class="text-yellow-300 terminal-font text-xs">Frundles</span>
						</button>
						<div class="my-1 border-t border-green-500/20"></div>
						<a
							href="https://github.com/aflansburg"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-zinc-700/50 text-zinc-300 hover:text-cyan-400 cursor-pointer"
							onclick={() => showGadgets = false}
							role="menuitem"
						>
							<GitHubIcon />
							<span class="terminal-font text-xs">GitHub</span>
						</a>
						<button
							class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-zinc-700/50 text-zinc-300 hover:text-gray-200 cursor-pointer"
							onclick={() => { openYouTubeModal(youtubeVideoId); showGadgets = false; }}
							role="menuitem"
						>
							<SkullIcon />
							<span class="terminal-font text-xs">Sad</span>
						</button>
						<button
							class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-zinc-700/50 text-zinc-300 hover:text-green-400 cursor-pointer"
							onclick={() => { openYouTubeModal(rickAndMortyVideoId); showGadgets = false; }}
							role="menuitem"
						>
							<RickAndMortyIcon />
							<span class="terminal-font text-xs">In the City</span>
						</button>
						<div class="my-1 border-t border-green-500/20"></div>
						<button
							class="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-zinc-700/50 text-zinc-300 hover:text-cyan-400 cursor-pointer"
							onclick={() => { openChangelogModal(); showGadgets = false; }}
							role="menuitem"
						>
							<QuestionMarkIcon />
							<span class="terminal-font text-xs">Changelog</span>
						</button>
					</div>
				{/if}
			</li>
		</ul>
	</nav>

	<!-- Mobile navigation dropdown -->
	{#if isMenuOpen}
		<!-- Overlay -->
		<div
			class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm md:hidden"
			onclick={toggleMenu}
			aria-hidden="true"
		></div>

		<!-- Menu -->
		<div
			class="animate-slide-right fixed top-0 right-0 z-50 h-screen max-h-screen w-[85%] max-w-xs overflow-y-auto rounded-l-lg {$colorMode ===
			'dark'
				? 'border-y-2 border-l-2 border-zinc-600/50 bg-zinc-800/95 text-zinc-50 shadow-[-5px_0_20px_rgba(39,39,42,0.3)]'
				: 'border-y-2 border-l-2 border-zinc-300/50 bg-white/95 text-zinc-800 shadow-[-5px_0_20px_rgba(228,228,231,0.3)]'} md:hidden"
			role="dialog"
			aria-labelledby="mobile-menu-title"
		>
			<div class="relative px-4 py-6">
				<button
					onclick={toggleMenu}
					class="absolute top-4 right-4 cursor-pointer {$colorMode === 'dark'
						? 'text-zinc-400 hover:text-zinc-100'
						: 'text-zinc-500 hover:text-zinc-800'} focus:outline-none"
					aria-label="Close menu"
				>
					<CloseIcon />
				</button>

				<h2
					id="mobile-menu-title"
					class="mb-6 border-b pb-2 text-xl font-bold {$colorMode === 'dark'
						? 'border-zinc-700/50 text-zinc-300'
						: 'border-zinc-300/50 text-zinc-700'}"
				>
					{$weirdWord} Menu
				</h2>

				<div class="space-y-4">
					<a
						href="/about"
						class="block px-4 py-3 text-lg font-medium transition-all hover:text-cyan-500 {$colorMode ===
						'dark'
							? 'hover:bg-zinc-700/70'
							: 'hover:bg-zinc-100/70'} rounded-md"
						onclick={toggleMenu}
					>
						About Me
					</a>
					<a
						href="/work"
						class="block px-4 py-3 text-lg font-medium transition-all hover:text-cyan-500 {$colorMode ===
						'dark'
							? 'hover:bg-zinc-700/70'
							: 'hover:bg-zinc-100/70'} rounded-md"
						onclick={toggleMenu}
					>
						My Work
					</a>
					<a
						href="/contact"
						class="block px-4 py-3 text-lg font-medium transition-all hover:text-cyan-500 {$colorMode ===
						'dark'
							? 'hover:bg-zinc-700/70'
							: 'hover:bg-zinc-100/70'} rounded-md"
						onclick={toggleMenu}
					>
						Contact
					</a>
					<a
						href="/transmissions"
						class="block px-4 py-3 text-lg font-medium transition-all hover:text-cyan-500 {$colorMode ===
						'dark'
							? 'hover:bg-zinc-700/70'
							: 'hover:bg-zinc-100/70'} rounded-md"
						onclick={toggleMenu}
					>
						Transmissions
					</a>
					<!-- Gadgets collapsible section -->
					<button
						class="flex w-full items-center justify-between rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3 text-lg font-medium terminal-font text-green-400 transition-all hover:bg-green-500/20 hover:border-green-400 cursor-pointer"
						style="text-shadow: 0 0 8px rgba(0, 255, 65, 0.3);"
						onclick={() => showMobileGadgets = !showMobileGadgets}
						aria-expanded={showMobileGadgets}
					>
						<span><span class="mr-2">&#9881;</span>Gadgets</span>
						<span class="text-sm transition-transform duration-200 {showMobileGadgets ? 'rotate-180' : ''}">&#9660;</span>
					</button>

					{#if showMobileGadgets}
					<div class="space-y-2 pl-2 animate-slide-down">
						<a
							href="/this-route-def-does-not-exist"
							class="flex items-center justify-center w-full py-2 rounded-lg border-4 border-red-600 bg-red-600/20 transition-all group hover:bg-red-600/40 hover:border-red-500 active:scale-95"
							title="Don't click this!"
							style="box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.3);"
							onclick={toggleMenu}
						>
							<span class="text-red-500 text-2xl group-hover:scale-110 transition-transform font-bold" style="text-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444; filter: brightness(2.5) contrast(2.5) saturate(2.5)); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">Don't press this button</span>
						</a>
						<button
							onclick={() => {
								showMatrixRain = true;
								toggleMenu();
							}}
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99] cursor-pointer"
							aria-label="Enter the Matrix"
						>
							<div class="text-green-400">
								<span class="text-lg font-bold terminal-font" style="text-shadow: 0 0 10px #22c55e;">M</span>
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>Enter the Matrix</span
							>
						</button>
						<button
							onclick={() => {
								showFrundles = true;
								toggleMenu();
							}}
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99] cursor-pointer"
							aria-label="Jerry: Don't click this"
						>
							<div class="text-yellow-400">
								<span class="text-lg font-bold terminal-font" style="text-shadow: 0 0 10px #eab308;">!</span>
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>Jerry: Don't click this</span
							>
						</button>
						<a
							href="https://github.com/aflansburg"
							target="_blank"
							rel="noopener noreferrer"
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99]"
							aria-label="GitHub Profile"
						>
							<div class={$colorMode === 'dark' ? 'text-zinc-400/50' : 'text-zinc-900'}>
								<GitHubIcon />
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>GitHub</span
							>
						</a>
						<a
							href="https://www.linkedin.com/in/abramflansburg/"
							target="_blank"
							rel="noopener noreferrer"
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99]"
							aria-label="LinkedIn Profile"
						>
							<div class={$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}>
								<LinkedInIcon />
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>LinkedIn</span
							>
						</a>
						<button
							onclick={() => {
								openYouTubeModal(youtubeVideoId);
								toggleMenu();
							}}
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99] cursor-pointer"
							aria-label="Sad"
						>
							<div class="text-white">
								<SkullIcon />
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>Sad</span
							>
						</button>
						<button
							onclick={() => {
								openYouTubeModal(rickAndMortyVideoId);
								toggleMenu();
							}}
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99] cursor-pointer"
							aria-label="In the City"
						>
							<div class="text-green-400">
								<RickAndMortyIcon />
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>In the City</span
							>
						</button>
						<button
							onclick={() => {
								openChangelogModal();
								toggleMenu();
							}}
							class="{$colorMode === 'dark' ? 'text-zinc-500/60' : 'text-zinc-400/80'}
								flex w-full transform items-center gap-3 rounded-md border px-4 py-3
								shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow active:scale-[0.99] cursor-pointer"
							aria-label="View changelog"
						>
							<div class="text-terminal-green">
								<QuestionMarkIcon />
							</div>
							<span class="font-medium {$colorMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}"
								>Changelog</span
							>
						</button>
					</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<div
		class="min-h-screen overflow-x-hidden px-4 pt-4 pb-16 sm:px-8 sm:pt-8 sm:pb-32 md:pt-8 md:pb-32 lg:pt-8 lg:pb-36 terminal-font {$colorMode ===
		'light'
			? 'bg-black text-green-400'
			: 'bg-zinc-950 text-green-300'}"
	>
		{@render children()}
	</div>

	<!-- VHS Glitch Overlay -->
	{#if vhsGlitching}
		<div class="vhs-glitch-overlay"></div>
	{/if}

	<!-- Konami Code Matrix Runes Overlay -->
	{#if konamiActivated}
		<div class="matrix-runes-overlay fixed inset-0 z-[9998] pointer-events-none">
			<!-- Matrix runes scattered across the screen -->
			<div class="matrix-rune" style="left: 5%; top: 10%; animation-delay: 0s;">ᚠ</div>
			<div class="matrix-rune" style="left: 15%; top: 25%; animation-delay: 0.3s;">ᚢ</div>
			<div class="matrix-rune" style="left: 25%; top: 15%; animation-delay: 0.6s;">ᚦ</div>
			<div class="matrix-rune" style="left: 35%; top: 35%; animation-delay: 0.9s;">ᚨ</div>
			<div class="matrix-rune" style="left: 45%; top: 20%; animation-delay: 1.2s;">ᚱ</div>
			<div class="matrix-rune" style="left: 55%; top: 40%; animation-delay: 1.5s;">ᚲ</div>
			<div class="matrix-rune" style="left: 65%; top: 10%; animation-delay: 1.8s;">ᚷ</div>
			<div class="matrix-rune" style="left: 75%; top: 30%; animation-delay: 2.1s;">ᚹ</div>
			<div class="matrix-rune" style="left: 85%; top: 45%; animation-delay: 2.4s;">ᚺ</div>
			<div class="matrix-rune" style="left: 10%; top: 55%; animation-delay: 0.4s;">ᚾ</div>
			<div class="matrix-rune" style="left: 30%; top: 65%; animation-delay: 0.7s;">ᛁ</div>
			<div class="matrix-rune" style="left: 50%; top: 70%; animation-delay: 1.0s;">ᛃ</div>
			<div class="matrix-rune" style="left: 70%; top: 60%; animation-delay: 1.3s;">ᛇ</div>
			<div class="matrix-rune" style="left: 90%; top: 75%; animation-delay: 1.6s;">ᛈ</div>
			<div class="matrix-rune" style="left: 20%; top: 80%; animation-delay: 1.9s;">ᛉ</div>
			<div class="matrix-rune" style="left: 40%; top: 85%; animation-delay: 2.2s;">ᛋ</div>
			<div class="matrix-rune" style="left: 60%; top: 90%; animation-delay: 2.5s;">ᛏ</div>
			<div class="matrix-rune" style="left: 80%; top: 85%; animation-delay: 2.8s;">ᛒ</div>
			<!-- Binary/Hex scattered around -->
			<div class="matrix-rune binary" style="left: 12%; top: 45%; animation-delay: 0.5s;">01100011</div>
			<div class="matrix-rune binary" style="left: 38%; top: 55%; animation-delay: 1.1s;">0xFF42</div>
			<div class="matrix-rune binary" style="left: 62%; top: 25%; animation-delay: 1.7s;">11010001</div>
			<div class="matrix-rune binary" style="left: 78%; top: 65%; animation-delay: 2.3s;">0x137C</div>
			<!-- Portal symbols -->
			<div class="matrix-rune portal" style="left: 8%; top: 70%; animation-delay: 0.8s;">◉</div>
			<div class="matrix-rune portal" style="left: 88%; top: 15%; animation-delay: 1.4s;">⬢</div>
			<div class="matrix-rune portal" style="left: 42%; top: 75%; animation-delay: 2.0s;">◈</div>
			<div class="matrix-rune portal" style="left: 68%; top: 40%; animation-delay: 2.6s;">◇</div>
		</div>
	{/if}

	<!-- YouTube Video Modal -->
	<YouTubeModal
		videoId={currentVideoId}
		isOpen={showYouTubeModal}
		onClose={closeYouTubeModal}
	/>

	<!-- Matrix Lyrics Overlay -->
	<MatrixLyrics isActive={showMatrixLyrics} lyrics={currentLyrics} mode={lyricsMode} />

	<!-- Changelog Modal -->
	<ChangelogModal
		isOpen={showChangelogModal}
		onClose={closeChangelogModal}
	/>

	<!-- Matrix Rain Overlay -->
	<MatrixRain active={showMatrixRain} onClose={() => showMatrixRain = false} showImages />

	<!-- Mr. Frundles Easter Egg -->
	<MrFrundles active={showFrundles} onClose={() => showFrundles = false} />
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

	/* Mobile menu animations */
	:global(.animate-fade-in) {
		animation: fadeIn 0.3s ease-out forwards;
	}

	:global(.animate-slide-right) {
		animation: slideRight 0.3s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideRight {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
