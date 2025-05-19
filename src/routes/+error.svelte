<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let showAlert = true;
	let alarmPlaying = false;
	let audio: HTMLAudioElement;

	function toggleAlarm() {
		if (!audio) return;

		if (!alarmPlaying) {
			audio
				.play()
				.then(() => {
					alarmPlaying = true;
				})
				.catch((err) => {
					console.error('Could not play audio', err);
				});
		} else {
			audio.pause();
			alarmPlaying = false;
		}
	}

	onMount(() => {
		// Flash the alert elements
		const interval = setInterval(() => {
			showAlert = !showAlert;
		}, 800);

		// Setup alarm sound
		audio = new Audio('/nostromo_sd_alarm.mp3');
		audio.volume = 0.3;
		audio.loop = true;

		return () => {
			clearInterval(interval);
			if (audio) audio.pause();
		};
	});
</script>

<div class="error-container">
	<div
		class="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden bg-black pt-[3vh]"
	>
		<!-- Multiple pulsing background elements -->
		<div class="fixed inset-0 flex items-center justify-center">
			<span class="animate-pulse-glow absolute z-0 h-1/4 w-1/3 rounded-full opacity-60 blur-3xl"
			></span>
		</div>
		<div class="animate-flashing fixed top-0 right-0 left-0 h-2 bg-red-600"></div>
		<div class="animate-flashing-delayed fixed right-0 bottom-0 left-0 h-2 bg-red-600"></div>

		<!-- Alert warning strips -->
		<div class="alert-stripes fixed inset-0 opacity-20"></div>

		<!-- Main content -->
		<div
			class="relative z-10 flex max-h-screen w-full flex-col items-center gap-2 px-4 text-center sm:gap-4 sm:px-6"
		>
			<!-- Warning symbol -->
			<div class="warning-symbol {showAlert ? 'visible' : 'invisible'} scale-75 sm:scale-100">
				<div class="triangle"></div>
				<span>!</span>
			</div>

			<!-- ERROR heading -->
			<h1
				class="animate-pulse-text mb-2 text-4xl font-bold tracking-wider text-red-500 sm:text-6xl"
			>
				ERROR
			</h1>

			<!-- Status code -->
			<div class="error-code-container">
				<p
					class="rounded-md border border-red-500/50 bg-red-900/30 px-4 py-1 font-mono text-2xl tracking-widest text-red-300 sm:px-6 sm:py-2 sm:text-4xl"
				>
					{page.status}
				</p>
			</div>

			<!-- Error message -->
			<div class="mt-2 max-w-lg">
				<p
					class="rounded-md border border-red-500/30 bg-red-900/20 px-4 py-2 text-sm text-red-100 sm:px-6 sm:py-3 sm:text-xl"
				>
					{page.error?.message || 'Unknown error occurred'}
				</p>
			</div>

			<!-- Buttons -->
			<div class="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-4">
				<a
					href="/"
					class="rounded-md border border-red-500/50 bg-red-900/60 px-4 py-2 text-sm text-white transition-all hover:scale-105 hover:bg-red-800 sm:px-6 sm:py-3 sm:text-base"
				>
					Return to Safety
				</a>

				<button
					class="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base {alarmPlaying
						? 'bg-red-700'
						: 'bg-red-900/40'} flex items-center gap-2 rounded-md border border-red-500/50 text-white transition-all hover:bg-red-800"
					onclick={toggleAlarm}
				>
					<span
						class="inline-block h-3 w-3 sm:h-4 sm:w-4 {alarmPlaying
							? 'animate-pulse bg-red-400'
							: 'bg-red-300'} rounded-full"
					></span>
					{alarmPlaying ? 'Silence Alarm' : 'Activate Alarm'}
				</button>
			</div>
		</div>

		<!-- Corner alert lights -->
		<div class="alert-light absolute top-4 left-4 {showAlert ? 'light-on' : ''}"></div>
		<div class="alert-light absolute top-4 right-4 {showAlert ? '' : 'light-on'}"></div>
		<div class="alert-light absolute bottom-4 left-4 {showAlert ? '' : 'light-on'}"></div>
		<div class="alert-light absolute right-4 bottom-4 {showAlert ? 'light-on' : ''}"></div>
	</div>
</div>

<style>
	/* Override layout container */
	.error-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999;
	}

	/* Apply these styles only when error component exists */
	:global(html:has(.error-container) nav) {
		display: none;
	}

	:global(html:has(.error-container) body) {
		overflow: hidden;
		margin: 0;
		padding: 0;
	}

	:global(html:has(.error-container) .min-h-screen) {
		padding: 0;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.5;
			box-shadow:
				0 0 40px 20px #ee2222,
				0 0 80px 40px rgba(228, 82, 89, 0.2);
		}
		50% {
			opacity: 0.9;
			box-shadow:
				0 0 100px 50px #f52072,
				0 0 200px 100px #b400246d;
		}
	}

	@keyframes flashing {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.2;
		}
	}

	@keyframes pulse-text {
		0%,
		100% {
			text-shadow: 0 0 8px rgba(239, 68, 68, 0.7);
		}
		50% {
			text-shadow: 0 0 20px rgba(239, 68, 68, 1);
		}
	}

	.animate-pulse-glow {
		animation: pulse-glow 2s infinite;
	}

	.animate-flashing {
		animation: flashing 1s infinite;
	}

	.animate-flashing-delayed {
		animation: flashing 1s infinite 0.5s;
	}

	.animate-pulse-text {
		animation: pulse-text 2s infinite;
	}

	.alert-stripes {
		background: repeating-linear-gradient(
			45deg,
			rgba(239, 68, 68, 0.1),
			rgba(239, 68, 68, 0.1) 10px,
			rgba(239, 68, 68, 0.3) 10px,
			rgba(239, 68, 68, 0.3) 20px
		);
	}

	.alert-light {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: rgba(220, 38, 38, 0.2);
		border: 2px solid rgba(239, 68, 68, 0.6);
		transition: all 0.3s ease;
	}

	.light-on {
		background-color: rgba(239, 68, 68, 1);
		box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
	}

	.warning-symbol {
		position: relative;
		width: 80px;
		height: 80px;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: opacity 0.3s ease;
	}

	.triangle {
		position: absolute;
		width: 0;
		height: 0;
		border-left: 40px solid transparent;
		border-right: 40px solid transparent;
		border-bottom: 72px solid rgb(255, 204, 0);
		transform: translateY(-5px);
	}

	.warning-symbol span {
		position: relative;
		z-index: 1;
		transform: translateY(8px);
		font-size: 36px;
		font-weight: 900;
		color: black;
	}

	.error-code-container {
		position: relative;
	}

	.error-code-container::before,
	.error-code-container::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 16px;
		height: 2px;
		background-color: rgba(239, 68, 68, 0.7);
	}

	.error-code-container::before {
		left: -24px;
		transform: translateY(-50%);
	}

	.error-code-container::after {
		right: -24px;
		transform: translateY(-50%);
	}

	/* Media query for very small screens */
	@media (max-height: 500px) {
		.warning-symbol {
			width: 60px;
			height: 60px;
			scale: 0.7;
		}
		.triangle {
			border-left: 30px solid transparent;
			border-right: 30px solid transparent;
			border-bottom: 54px solid rgb(255, 204, 0);
		}
		.warning-symbol span {
			font-size: 28px;
		}
	}
</style>
