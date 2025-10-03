<script lang="ts">
	import { onMount } from 'svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import { PUBLIC_MY_NAME, PUBLIC_AVATAR_IMG_PATH } from '$env/static/public';
	import { avatarImage } from '$lib/stores/avatarImage.svelte';
	import { name, identityRevealed } from '$lib/stores/identity.svelte';

	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = $state(0);
	let spinnerInterval: ReturnType<typeof setInterval>;
	let activeTrack = $state<string | null>(null);

	interface Track {
		title: string;
		date: string;
		embedUrl: string;
		classification: string;
	}

	const myName = PUBLIC_MY_NAME;

	const tracks: Track[] = [
		{
			title: 'Hope clouds observation',
			date: '2024-03-19',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/hope-clouds-observation&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_P-127'
		},
		{
			title: 'Dialectic Dessert',
			date: '2023-11-18',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/dialectic-dessert&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_Q-404'
		},
		{
			title: 'Curse of Dimensionality',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/curse-of-dimensionality&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_X-999'
		},
		{
			title: 'TimeLux',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/timelux&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_T-777'
		},
		{
			title: 'Good Morning Starshine',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/good-morning-starshine-by&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_G-555'
		},
		{
			title: 'New concept w/ Suhr SE100',
			date: '2025-09-05',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/new-concept-w-suhr-se100&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_C-742'
		},
		{
			title: 'A 3-Hour Thanksgiving',
			date: '2024-11-30',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/a-3-hour-thanksgiving&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_K-83'
		},
		{
			title: 'Masterpiece Arcade',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/masterpiece-arcade&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_M-888'
		},
		{
			title: 'Cirrus',
			date: '2023-11-11',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/cirrus&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_R-212'
		},
		{
			title: 'Heartbeats',
			date: '2023-09-24',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/heartbeats&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_M-66'
		},
		{
			title: 'Windy Road (Draft 2)',
			date: '2022-07-22',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/windy-road-draft-2&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_W-314'
		},
		{
			title: 'Aborted cover of Tomorrow',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/aborted-cover-of-tomorrow-by&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_A-101'
		},
		{
			title: 'A Little Digital Something',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/a-little-digital-something&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_D-202'
		},
		{
			title: 'Glory to God (GTG)',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/glory-to-god-gtg&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_G-777'
		},
		{
			title: 'Classical Steinway Harpsichord',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/classical-steinway-harpsichord&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_S-303'
		},
		{
			title: 'Way Too Happy',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/way-too-happy&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_H-404'
		},
		{
			title: 'A Musical Offering',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/a-musical-offering&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_B-505'
		},
		{
			title: 'Deep Chip Rush',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/deep-chip-rush&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_C-808'
		},
		{
			title: 'Sunset Driven',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/sunset-driven&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_S-606'
		},
		{
			title: 'Writers Block',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/writers-block&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_W-909'
		},
		{
			title: 'Trancey McTrancePants',
			date: '2023',
			embedUrl: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-271844266/tranceymctrancepants-mp3&color=%2300ff41&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
			classification: 'DIMENSION_T-303'
		}
	];

	const toggleTrack = (title: string) => {
		activeTrack = activeTrack === title ? null : title;
	};

	onMount(() => {
		// Reveal identity by default on this page
		avatarImage.set('/' + PUBLIC_AVATAR_IMG_PATH);
		name.set(PUBLIC_MY_NAME);
		identityRevealed.set(true);

		spinnerInterval = setInterval(() => {
			currentSpinnerFrame = (currentSpinnerFrame + 1) % spinnerFrames.length;
		}, 80);

		return () => {
			clearInterval(spinnerInterval);
		};
	});
</script>

<svelte:head>
	<title>{$weirdWord} - Interdimensional Music</title>
</svelte:head>

<div class="music-container terminal-font" class:dark={$colorMode === 'dark'}>
	<!-- Mobile Header -->
	<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 mb-4 block sm:hidden terminal-font text-xs">
		<div class="text-terminal-green font-bold text-center mb-1">INTERDIMENSIONAL AUDIO</div>
		<div class="text-terminal-green font-bold text-center">TRANSMISSION DATABASE</div>
	</div>
	<!-- Desktop Header -->
	<div class="rounded-md border border-terminal-green/50 bg-black/20 px-6 py-4 mb-6 hidden sm:block terminal-font text-sm">
		<div class="text-terminal-green font-bold text-center">INTERDIMENSIONAL AUDIO TRANSMISSION DATABASE</div>
	</div>

	<div class="ascii-art mb-6">
> AUDIO_FREQUENCY_SCANNER: ACTIVE
> MULTIVERSE_MUSIC_PROTOCOL: ENGAGED
	</div>

	<h1 class="mb-4 text-2xl font-bold sci-fi-header text-terminal-green">SONIC EXPERIMENTS ARCHIVE</h1>

	<div class="mb-6 p-4 terminal-border rounded-md bg-black/20">
		<p class="text-terminal-green mb-2">
			> <strong class="text-portal-orange">CITADEL NOTICE:</strong> All audio transmissions composed and performed solo by the entity known as {myName.toUpperCase().split(' ')[0]}.
		</p>
		<p class="text-terminal-blue mb-2">
			> <strong class="text-rick-cyan">COMPOSITION METHOD:</strong> 100% organic humanoid creativity - zero AI/collaboration assistance.
		</p>
		<p class="text-terminal-green mb-2">
			> <strong class="text-neon-purple">PERFORMANCE STATUS:</strong> Solo instrumentation and production across all dimensional frequencies.
		</p>
		<p class="text-neon-purple">
			> <strong class="text-portal-orange">FULL ARCHIVE ACCESS:</strong> <a href="https://soundcloud.com/user-271844266" target="_blank" class="text-rick-cyan hover:text-portal-orange underline hover:no-underline transition-colors">SOUNDCLOUD.COM/USER-271844266</a>
		</p>
	</div>

	<div class="tracks-list space-y-4">
		{#each tracks as track, index}
			<div class="track-item terminal-border rounded-md bg-black/90 p-4 hover:bg-black/95 transition-all">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-2">
							<span class="text-terminal-green text-xs">●</span>
							<span class="text-terminal-green/60 text-xs terminal-font">{track.classification}</span>
						</div>
						<button
							type="button"
							onclick={() => toggleTrack(track.title)}
							class="text-left w-full group"
							aria-label="Toggle track player for {track.title}"
						>
							<h3 class="text-lg font-bold text-rick-cyan group-hover:text-portal-orange transition-colors terminal-font mb-1">
								▶ {track.title.toUpperCase()}
							</h3>
							<div class="text-terminal-green/70 text-sm">
								> TRANSMISSION_DATE: {track.date}
							</div>
						</button>
					</div>
					<button
						type="button"
						onclick={() => toggleTrack(track.title)}
						class="terminal-button px-3 py-1 rounded text-xs"
						aria-label="{activeTrack === track.title ? 'Hide' : 'Show'} player"
					>
						{activeTrack === track.title ? '⊟ HIDE' : '⊞ LOAD'}
					</button>
				</div>

				{#if activeTrack === track.title}
					<div class="mt-4 animate-slide-up">
						<div class="rounded-md border border-terminal-green/30 p-2 bg-black/90">
							<iframe
								title="{track.title} SoundCloud Player"
								width="100%"
								height="166"
								scrolling="no"
								frameborder="no"
								allow="autoplay"
								src={track.embedUrl.replace('auto_play=false', 'auto_play=true').replace('color=%2300ff41', 'color=%2300cc33')}
								class="w-full"
							></iframe>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="rounded-md border border-terminal-green/50 bg-black/20 px-6 py-4 mt-8 text-center terminal-font text-sm">
		<div class="text-terminal-green font-bold mb-2">END OF AUDIO TRANSMISSION DATABASE</div>
		<div class="text-terminal-green/80 mb-3">
			<span class="spinner inline-block text-terminal-blue">{spinnerFrames[currentSpinnerFrame]}</span>
			SCANNING FOR NEW TRANSMISSIONS...
		</div>
		<div class="text-xs text-terminal-green/60 mb-4">
			> SYSTEM_STATUS: All audio files authenticated as human-generated
		</div>
		<div class="border-t border-terminal-green/20 pt-4 mt-4">
			<div class="text-terminal-green/70 text-xs mb-2">
				> Music is my passion, but my day-to-day work is quite intriguing.
				<br>
				If you'd like to know more, you can peep my LinkedIn or contact me directly.
			</div>
			<a
				href="https://www.linkedin.com/in/abramflansburg/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-rick-cyan hover:text-portal-orange underline hover:no-underline transition-colors"
			>LINKEDIN.COM/IN/ABRAMFLANSBURG</a>
		</div>
	</div>
</div>

<style>
	.spinner {
		width: 1em;
		margin-right: 0.5em;
	}

	@keyframes slideUp {
		from {
			transform: translateY(10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-slide-up {
		animation: slideUp 0.3s ease-out forwards;
	}

	/* Override terminal colors for light mode readability */
	:global(.music-container .text-terminal-green) {
		color: #00cc33 !important;
	}

	:global(.dark .music-container .text-terminal-green) {
		color: var(--terminal-green) !important;
	}

	:global(.music-container .text-terminal-blue) {
		color: #2563eb !important;
	}

	:global(.dark .music-container .text-terminal-blue) {
		color: var(--terminal-blue) !important;
	}

	:global(.music-container .text-rick-cyan) {
		color: #0891b2 !important;
	}

	:global(.dark .music-container .text-rick-cyan) {
		color: var(--rick-cyan) !important;
	}

	:global(.music-container .text-portal-orange) {
		color: #ea580c !important;
	}

	:global(.dark .music-container .text-portal-orange) {
		color: var(--portal-orange) !important;
	}

	:global(.music-container .text-neon-purple) {
		color: #9333ea !important;
	}

	:global(.dark .music-container .text-neon-purple) {
		color: var(--neon-purple) !important;
	}

	.track-item {
		transition: all 0.3s ease;
	}

	.track-item:hover {
		box-shadow: 0 0 15px rgba(0, 255, 65, 0.2);
	}
</style>
