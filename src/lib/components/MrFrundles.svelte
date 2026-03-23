<script lang="ts">
	interface Props {
		active: boolean;
		onClose: () => void;
	}

	let { active, onClose }: Props = $props();

	let phase = $state<'idle' | 'float' | 'chomp' | 'reveal'>('idle');
	let timeouts: ReturnType<typeof setTimeout>[] = [];

	function clearTimeouts() {
		timeouts.forEach(clearTimeout);
		timeouts = [];
	}

	function startSequence() {
		phase = 'float';

		// After float animation completes (~3s), show CHOMP
		timeouts.push(setTimeout(() => {
			phase = 'chomp';

			// After CHOMP (~1.5s), show reveal
			timeouts.push(setTimeout(() => {
				phase = 'reveal';
			}, 1500));
		}, 3000));
	}

	function dismiss() {
		clearTimeouts();
		phase = 'idle';
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') dismiss();
	}

	$effect(() => {
		if (active) {
			startSequence();
			window.addEventListener('keydown', handleKeydown);
		}
		return () => {
			clearTimeouts();
			window.removeEventListener('keydown', handleKeydown);
			phase = 'idle';
		};
	});
</script>

{#if active}
	<div class="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
		<!-- Backdrop -->
		<button
			class="fixed inset-0 w-full h-full bg-black/90 backdrop-blur-sm cursor-pointer animate-fade-in z-0"
			onclick={dismiss}
			aria-label="Close Mr. Frundles"
		></button>

		<!-- Phase: Float -->
		{#if phase === 'float'}
			<div class="frundles-float pointer-events-none z-10">
				<img
					src="/images/mr-frundles.png"
					alt="Mr. Frundles"
					class="frundles-img"
				/>
			</div>
		{/if}

		<!-- Phase: Chomp -->
		{#if phase === 'chomp'}
			<div class="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
				<span class="chomp-text">CHOMP!</span>
			</div>
		{/if}

		<!-- Phase: Reveal -->
		{#if phase === 'reveal'}
			<div class="fixed inset-0 pointer-events-none z-10 overflow-hidden">
				<img
					src="/images/mr-frundles-eyes.png"
					alt="Mr. Frundles eyes"
					class="frundles-eyes"
				/>
				<span class="frundles-name">I'm Mr. Frundles!!</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.4s ease-out forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Float phase: bottom-left to above center */
	.frundles-float {
		position: fixed;
		z-index: 10;
		animation: floatUp 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
	}

	.frundles-img {
		width: 200px;
		height: auto;
		filter: drop-shadow(0 0 20px rgba(0, 255, 65, 0.4));
	}

	@keyframes floatUp {
		0% {
			bottom: -10%;
			left: 5%;
			transform: rotate(-10deg) scale(0.8);
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		50% {
			transform: rotate(8deg) scale(1);
		}
		75% {
			transform: rotate(-5deg) scale(1.05);
		}
		100% {
			bottom: 55%;
			left: 35%;
			transform: rotate(3deg) scale(1);
			opacity: 1;
		}
	}

	/* Chomp phase */
	.chomp-text {
		font-size: clamp(4rem, 15vw, 12rem);
		font-weight: 900;
		color: #00ff41;
		text-shadow:
			0 0 20px #00ff41,
			0 0 40px #00ff41,
			0 0 80px rgba(0, 255, 65, 0.5),
			4px 4px 0 #000;
		animation: chompBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		font-family: 'Impact', 'Arial Black', sans-serif;
		letter-spacing: 0.05em;
		-webkit-text-stroke: 2px rgba(0, 0, 0, 0.3);
	}

	@keyframes chompBounce {
		0% {
			transform: scale(0.1) rotate(-10deg);
			opacity: 0;
		}
		50% {
			transform: scale(1.3) rotate(3deg);
			opacity: 1;
		}
		70% {
			transform: scale(0.9) rotate(-2deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
		}
	}

	/* Reveal phase */
	.frundles-eyes {
		width: clamp(180px, 50vw, 280px);
		height: auto;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(1);
		animation: eyesAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		filter: drop-shadow(0 0 30px rgba(0, 255, 65, 0.3));
	}

	@media (min-width: 1024px) {
		.frundles-eyes {
			width: clamp(250px, 25vw, 400px);
		}
	}

	@keyframes eyesAppear {
		0% {
			transform: translate(-50%, -50%) scale(0.3);
			opacity: 0;
		}
		60% {
			transform: translate(-50%, -50%) scale(1.1);
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}

	.frundles-name {
		position: absolute;
		bottom: 8vh;
		left: 50%;
		transform: translateX(-50%);
		font-size: clamp(2rem, 8vw, 5rem);
		font-weight: 900;
		color: #00ff41;
		text-shadow:
			0 0 15px #00ff41,
			0 0 30px #00ff41,
			0 0 60px rgba(0, 255, 65, 0.4),
			3px 3px 0 #000;
		font-family: 'Impact', 'Arial Black', sans-serif;
		letter-spacing: 0.05em;
		white-space: nowrap;
		animation: nameWobble 2s ease-in-out infinite, nameAppear 0.6s 0.3s ease-out both;
		-webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
	}

	@keyframes nameAppear {
		0% {
			transform: translateX(-50%) translateY(30px) scale(0.8);
			opacity: 0;
		}
		100% {
			transform: translateX(-50%) translateY(0) scale(1);
			opacity: 1;
		}
	}

	@keyframes nameWobble {
		0%, 100% {
			transform: translateX(-50%) rotate(-1deg) scale(1);
		}
		25% {
			transform: translateX(-50%) rotate(1.5deg) scale(1.03);
		}
		50% {
			transform: translateX(-50%) rotate(-0.5deg) scale(0.98);
		}
		75% {
			transform: translateX(-50%) rotate(1deg) scale(1.02);
		}
	}

	@media (min-width: 640px) {
		.frundles-img {
			width: 300px;
		}
	}
</style>
