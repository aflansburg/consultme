<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		showModal: boolean;
		character: { name: string; [key: string]: any };
		loading: boolean;
		aiResponse: string;
		terminalLogs: string[];
		spinnerFrames: string[];
		currentSpinnerFrame: number;
		onClose: () => void;
	}

	let {
		showModal,
		character,
		loading,
		aiResponse,
		terminalLogs,
		spinnerFrames,
		currentSpinnerFrame,
		onClose
	}: Props = $props();

	let logsContainer = $state<HTMLDivElement | undefined>();
	let canvas: HTMLCanvasElement | undefined;
	let animationId: number;

	// Matrix rain character sets
	const RUNES = 'ᛒᛏᛈᚹᚱᚨᚦᚢᚠᚷᚺᛃᛇᛉᛊᛋᛚᛗᛜᛝᛞᛟ';
	const KATAKANA = 'アイウエオカキクケコサシスセソタチツテト';
	const BINARY = '01';
	const KEYWORDS = ['C137', 'RICK', 'MORTY', 'PORTAL'];
	const ALL_CHARS = RUNES + KATAKANA + BINARY;

	interface Column {
		x: number;
		y: number;
		speed: number;
		chars: string[];
		trailLength: number;
	}

	let columns: Column[] = [];

	function randomChar(): string {
		// Occasionally use a keyword character sequence
		if (Math.random() < 0.02) {
			const kw = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
			return kw[0];
		}
		return ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
	}

	function initColumns(width: number, height: number) {
		const fontSize = 14;
		const colSpacing = 10; // tighter than fontSize (14) for denser columns
		const colCount = Math.floor(width / colSpacing);
		columns = [];
		for (let i = 0; i < colCount; i++) {
			const trailLength = 8 + Math.floor(Math.random() * 16);
			const chars: string[] = [];
			for (let j = 0; j < trailLength; j++) {
				chars.push(randomChar());
			}
			columns.push({
				x: i * colSpacing,
				y: Math.random() * -height,
				speed: 1 + Math.random() * 3,
				chars,
				trailLength
			});
		}
	}

	function drawMatrix() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;
		const fontSize = 14;

		// Clear fully each frame — no accumulation smearing
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, 0, width, height);

		ctx.font = `${fontSize}px 'JetBrains Mono', 'Courier New', monospace`;
		ctx.shadowBlur = 0;
		ctx.shadowColor = 'transparent';

		for (const col of columns) {
			for (let i = 0; i < col.chars.length; i++) {
				const charY = col.y - i * fontSize;
				if (charY < -fontSize || charY > height + fontSize) continue;

				// Randomly swap characters as they fall
				if (Math.random() < 0.03) {
					col.chars[i] = randomChar();
				}

				if (i === 0) {
					// Head: bright white
					ctx.fillStyle = '#ffffff';
				} else if (i < 3) {
					// Near head: bright green, fully legible
					ctx.fillStyle = 'rgba(0, 255, 65, 0.85)';
				} else {
					// Trail: gradual fade, still readable in upper portion
					const progress = i / col.trailLength;
					const alpha = Math.max(0.08, (1 - progress) * 0.65);
					ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
				}

				ctx.fillText(col.chars[i], col.x, charY);
			}

			// Move column down
			col.y += col.speed;

			// Reset when fully off screen
			if (col.y - col.trailLength * fontSize > height) {
				col.y = Math.random() * -200;
				col.speed = 1 + Math.random() * 3;
				// Refresh characters
				for (let j = 0; j < col.chars.length; j++) {
					col.chars[j] = randomChar();
				}
			}
		}

		animationId = requestAnimationFrame(drawMatrix);
	}

	function startMatrix() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = 'rgba(0, 0, 0, 1)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		initColumns(canvas.width, canvas.height);
		drawMatrix();
	}

	function handleResize() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		initColumns(canvas.width, canvas.height);
	}

	$effect(() => {
		if (showModal && canvas) {
			startMatrix();
			window.addEventListener('resize', handleResize);
		}
		return () => {
			if (animationId) cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
		};
	});

	// Auto-scroll terminal logs
	$effect(() => {
		if (logsContainer && terminalLogs.length > 0) {
			logsContainer.scrollTop = logsContainer.scrollHeight;
		}
	});
</script>

{#if showModal}
	<div
		class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
	>
		<!-- Canvas Matrix Rain -->
		<canvas
			bind:this={canvas}
			class="fixed inset-0 pointer-events-none z-0"
		></canvas>

		<!-- Invisible button that covers the backdrop for keyboard accessibility -->
		<button
			class="absolute inset-0 h-full w-full cursor-default bg-transparent z-[1]"
			onclick={onClose}
			aria-label="Close modal by clicking backdrop"
		></button>

		<div
			class="animate-slide-up relative z-10 w-full max-w-4xl rounded-lg terminal-border bg-black/98 p-4 sm:p-6 terminal-font crt-screen max-h-[90vh] overflow-hidden"
			role="dialog"
			aria-labelledby="modal-title"
			aria-modal="true"
		>
			<!-- Terminal-style close button - integrated with border -->
			<button
				onclick={onClose}
				class="absolute top-0 left-0 w-8 h-8 bg-black/90 hover:bg-black transition-all duration-200 flex items-center justify-center cursor-pointer focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:outline-none group border-r border-b border-terminal-green/30"
				aria-label="Close modal"
				title="Close terminal"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-terminal-green group-hover:text-green-400"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-6 py-4 hidden sm:block text-center mb-4 terminal-font text-sm">
				<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO DEEP ANALYSIS TERMINAL</div>
				<div class="text-terminal-green font-bold text-center">CITADEL DATABASE ACCESS</div>
			</div>
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 block sm:hidden text-center mb-4 terminal-font text-xs">
				<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO TERMINAL</div>
				<div class="text-terminal-green font-bold text-center">DATABASE ACCESS</div>
			</div>
			<h2
				id="modal-title"
				class="mb-4 border-b border-terminal-green/50 pb-2 text-xl font-bold text-terminal-green sci-fi-header"
			>
				ENTITY PROFILE: {character.name.toUpperCase()}
			</h2>

			<div
				class="terminal-text max-h-[70vh] overflow-y-auto pr-2 terminal-font leading-relaxed text-terminal-green"
			>
				{#if loading}
					<div class="rounded-md border border-terminal-green/50 bg-black/20 px-3 py-2 mb-4 text-xs terminal-font">
						<div class="text-terminal-green font-bold mb-1">REAL-TIME TERMINAL OUTPUT</div>
						<div class="text-terminal-green/80">STATUS: PROCESSING</div>
					</div>

					<!-- Terminal logs section -->
					<div bind:this={logsContainer} class="terminal-logs-container mb-4 max-h-40 overflow-y-auto bg-black/50 p-3 rounded border border-terminal-green/30">
						{#each terminalLogs as log}
							<div class="terminal-log-line text-xs text-terminal-green font-mono">
								<span>{log}</span>
							</div>
						{/each}
						{#if terminalLogs.length === 0}
							<div class="terminal-log-line text-xs text-terminal-green/60 font-mono">
								<span class="opacity-60">[{new Date().toLocaleTimeString()}]</span>
								<span class="ml-2">> INITIALIZING_SYSTEM...</span>
							</div>
						{/if}
					</div>

					<span class="glitch-text">
						<span class="spinner inline-block text-terminal-blue">{spinnerFrames[currentSpinnerFrame]}</span>
						<strong class="text-portal-orange">DEEP ANALYSIS IN PROGRESS...</strong>
					</span>
					{#if !aiResponse}
						<p class="mt-4 text-sm text-rick-cyan italic">
							> BACKGROUND PROCESSING ACTIVE: Modal can be closed - data will continue generating
						</p>
					{/if}
				{:else}
					<div class="ascii-art text-xs mb-2">
> DATA RETRIEVAL: COMPLETE
> ANALYSIS STATUS: PROCESSED
					</div>
					<pre class="text-terminal-green whitespace-pre-wrap font-mono text-sm leading-relaxed">{aiResponse}</pre>
					<br />
					<div class="mt-4 text-xs text-rick-cyan italic border-t border-terminal-green/30 pt-2">
						<strong>DISCLAIMER:</strong> Information accuracy varies across dimensional boundaries.
						Citadel databases may contain outdated or dimension-specific data.
						C-137-INFO system reliability: 94.7%
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-fade-in {
		animation: fadeIn 0.2s ease-out forwards;
	}

	.animate-slide-up {
		animation: slideUp 0.3s ease-out forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
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

	.terminal-text pre {
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1.4;
		overflow-x: auto;
	}

	.terminal-logs-container {
		scrollbar-width: thin;
		scrollbar-color: var(--terminal-green) transparent;
	}

	.terminal-logs-container::-webkit-scrollbar {
		width: 4px;
	}

	.terminal-logs-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.terminal-logs-container::-webkit-scrollbar-thumb {
		background: var(--terminal-green);
		border-radius: 2px;
	}

	.terminal-log-line {
		animation: terminal-log-appear 0.3s ease-out;
		padding: 1px 0;
	}

	@keyframes terminal-log-appear {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.spinner {
		width: 1em;
		margin-right: 0.5em;
	}
</style>
