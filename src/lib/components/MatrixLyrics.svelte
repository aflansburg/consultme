<script lang="ts">
	let { isActive = false, lyrics = "", mode = "matrix" }: { isActive?: boolean; lyrics?: string; mode?: "matrix" | "straight" } = $props();

	// The lyrics broken into individual words
	const lyricsWords = $derived(lyrics.split(' ').filter(word => word.length > 0));



	// Generate display data based on mode
	function generateDisplayData() {
		if (mode === "straight") {
			// Straight line mode - words appear centered one at a time
			return lyricsWords.map((word, index) => {
				const startDelay = (index * 0.95); // 0.95 seconds between words (0.25s faster)
				const isRed = index % 2 === 1;
				const glitchDelay = Math.random() * 2;

				return {
					word,
					left: '50%', // Center all words horizontally
					top: undefined, // Let CSS handle positioning
					animationDelay: `${startDelay}s`,
					colorClass: isRed ? 'red' : 'green',
					glitchDelay: `${glitchDelay}s`
				};
			});
		} else {
			// Matrix cascading mode
			const columns = 15;
			return lyricsWords.map((word, index) => {
				const column = index % columns;
				const leftPercent = (column / columns) * 100;
				const startDelay = (index * 0.6);
				const isRed = index % 2 === 1;
				const glitchDelay = Math.random() * 2;

				return {
					word,
					left: `${leftPercent}%`,
					top: undefined, // Will use animation for vertical movement
					animationDelay: `${startDelay}s`,
					colorClass: isRed ? 'red' : 'green',
					glitchDelay: `${glitchDelay}s`
				};
			});
		}
	}

	const displayWords = $derived(generateDisplayData());
</script>

<!-- Matrix Lyrics Overlay -->
{#if isActive}
	<div class="matrix-lyrics-overlay fixed inset-0 z-[10001] pointer-events-none">
		{#each displayWords as { word, left, top, animationDelay, colorClass, glitchDelay }}
			<div
				class="matrix-lyric-word {colorClass} {mode} mobile-visible"
				style="left: {left}; {top ? `top: ${top};` : ''} animation-delay: {animationDelay}, {glitchDelay};"
			>
				{word}
			</div>
		{/each}
	</div>
{/if}

<style>
	.matrix-lyrics-overlay {
		font-family: 'Courier New', monospace;
		overflow: hidden;
	}

	.matrix-lyric-word {
		position: absolute;
		font-weight: bold;
		white-space: nowrap;
		animation: matrix-glitch 1.8s infinite;
		letter-spacing: 1px;
		filter: brightness(1.1) contrast(1.2);
	}

	.matrix-lyric-word.matrix {
		top: -20px;
		font-size: 1.1rem;
		animation: matrix-lyrics-fall 30s linear forwards, matrix-glitch 1.8s infinite;
	}

	.matrix-lyric-word.straight {
		font-size: 3rem;
		animation: straight-scroll-down 25s linear forwards, matrix-glitch 1.8s infinite;
		text-transform: uppercase;
		font-weight: 900;
		text-align: center;
		width: auto;
		white-space: nowrap;
		top: -100px; /* Start above screen */
		transform: translateX(-50%); /* Center horizontally */
	}

	.matrix-lyric-word.green {
		color: rgba(20, 120, 60, 0.9);
		text-shadow:
			0 0 5px rgba(15, 100, 50, 0.8),
			0 0 10px rgba(20, 120, 60, 0.6),
			0 0 15px rgba(20, 120, 60, 0.4);
	}

	.matrix-lyric-word.red {
		color: rgba(150, 30, 30, 0.9);
		text-shadow:
			0 0 5px rgba(120, 20, 20, 0.8),
			0 0 10px rgba(150, 30, 30, 0.6),
			0 0 15px rgba(150, 30, 30, 0.4);
	}

	@keyframes matrix-lyrics-fall {
		0% {
			top: -20px;
			opacity: 0;
			transform: scale(0.9);
		}
		3% {
			opacity: 1;
			transform: scale(1);
		}
		97% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			top: calc(100vh + 20px);
			opacity: 0;
			transform: scale(0.9);
		}
	}

	@keyframes straight-scroll-down {
		0% {
			top: -100px;
			opacity: 0;
			transform: translateX(-50%) scale(0.9);
		}
		5% {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
		95% {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
		100% {
			top: calc(100vh + 100px);
			opacity: 0;
			transform: translateX(-50%) scale(0.9);
		}
	}

	@keyframes matrix-glitch {
		0%, 85%, 100% {
			transform: translateX(0) scale(1) skew(0deg);
			filter: hue-rotate(0deg) brightness(1.1) contrast(1.2);
		}
		3% {
			transform: translateX(-3px) scale(0.95) skew(2deg);
			filter: hue-rotate(180deg) brightness(1.5) contrast(1.8);
		}
		6% {
			transform: translateX(4px) scale(1.05) skew(-1deg);
			filter: hue-rotate(-120deg) brightness(0.8) contrast(2.0);
		}
		9% {
			transform: translateX(-2px) scale(0.98) skew(1deg);
			filter: hue-rotate(90deg) brightness(1.3) contrast(1.6);
		}
		12% {
			transform: translateX(3px) scale(1.02) skew(-2deg);
			filter: hue-rotate(-60deg) brightness(0.9) contrast(1.9);
		}
		15% {
			transform: translateX(0) scale(1) skew(0deg);
			filter: hue-rotate(0deg) brightness(1.1) contrast(1.2);
		}
		18% {
			transform: translateX(-1px) scale(0.99) skew(3deg);
			filter: hue-rotate(45deg) brightness(1.4) contrast(1.7);
		}
	}

	/* Mobile-first responsive sizing */
	@media (max-width: 640px) {
		.matrix-lyrics-overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 10002;
			overflow: hidden;
		}

		.matrix-lyric-word.matrix {
			font-size: 0.7rem;
		}

		.matrix-lyric-word.straight {
			font-size: 2rem;
			position: absolute;
			left: 50%;
			top: -100px;
			transform: translateX(-50%);
			animation: mobile-scroll-down 22s linear forwards, matrix-glitch 1.8s infinite;
			z-index: 10003;
			text-align: center;
			white-space: nowrap;
			font-weight: 900;
		}

		.matrix-lyric-word.straight.red {
			color: #ff6666;
			text-shadow: 0 0 15px #ff4444, 0 0 25px #ff2222;
		}

		.matrix-lyric-word.straight.green {
			color: #66ff66;
			text-shadow: 0 0 15px #44ff44, 0 0 25px #22ff22;
		}

		@keyframes mobile-scroll-down {
			0% {
				top: -100px;
				opacity: 0;
			}
			5% {
				opacity: 1;
			}
			95% {
				opacity: 1;
			}
			100% {
				top: calc(100vh + 100px);
				opacity: 0;
			}
		}
	}

	@media (min-width: 1024px) {
		.matrix-lyric-word.matrix {
			font-size: 1.1rem;
		}

		.matrix-lyric-word.straight {
			font-size: 4rem;
		}
	}
</style>