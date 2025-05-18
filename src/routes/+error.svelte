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

<div
	class="relative flex h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-black"
>
	<!-- Multiple pulsing background elements -->
	<div class="fixed inset-0 flex items-center justify-center">
		<span class="animate-pulse-glow absolute z-0 h-48 w-96 rounded-full opacity-60 blur-3xl"></span>
	</div>
	<div class="animate-flashing fixed top-0 right-0 left-0 h-2 bg-red-600"></div>
	<div class="animate-flashing-delayed fixed right-0 bottom-0 left-0 h-2 bg-red-600"></div>

	<!-- Alert warning strips -->
	<div class="alert-stripes fixed inset-0 opacity-20"></div>

	<!-- Main content -->
	<div class="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
		<!-- Warning symbol -->
		<div class="warning-symbol {showAlert ? 'visible' : 'invisible'}">
			<div class="triangle"></div>
			<span>!</span>
		</div>

		<!-- ERROR heading -->
		<h1 class="animate-pulse-text mb-4 text-6xl font-bold tracking-wider text-red-500">ERROR</h1>

		<!-- Status code -->
		<div class="error-code-container">
			<p
				class="rounded-md border border-red-500/50 bg-red-900/30 px-6 py-2 font-mono text-4xl tracking-widest text-red-300"
			>
				{page.status}
			</p>
		</div>

		<!-- Error message -->
		<div class="mt-4 max-w-lg">
			<p class="rounded-md border border-red-500/30 bg-red-900/20 px-6 py-4 text-xl text-red-100">
				{page.error?.message || 'Unknown error occurred'}
			</p>
		</div>

		<!-- Buttons -->
		<div class="mt-8 flex items-center gap-4">
			<a
				href="/"
				class="rounded-md border border-red-500/50 bg-red-900/60 px-6 py-3 text-white transition-all hover:scale-105 hover:bg-red-800"
			>
				Return to Safety
			</a>

			<button
				class="px-6 py-3 {alarmPlaying
					? 'bg-red-700'
					: 'bg-red-900/40'} flex items-center gap-2 rounded-md border border-red-500/50 text-white transition-all hover:bg-red-800"
				onclick={toggleAlarm}
			>
				<span
					class="inline-block h-4 w-4 {alarmPlaying
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

<style>
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
		width: 20px;
		height: 20px;
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
		width: 100px;
		height: 100px;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: opacity 0.3s ease;
	}

	.triangle {
		position: absolute;
		width: 0;
		height: 0;
		border-left: 50px solid transparent;
		border-right: 50px solid transparent;
		border-bottom: 90px solid rgb(255, 204, 0);
		transform: translateY(-5px);
	}

	.warning-symbol span {
		position: relative;
		z-index: 1;
		transform: translateY(10px);
		font-size: 42px;
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
		width: 20px;
		height: 3px;
		background-color: rgba(239, 68, 68, 0.7);
	}

	.error-code-container::before {
		left: -30px;
		transform: translateY(-50%);
	}

	.error-code-container::after {
		right: -30px;
		transform: translateY(-50%);
	}
</style>
