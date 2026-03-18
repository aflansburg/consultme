<script lang="ts">
	import MatrixRain from '$lib/components/MatrixRain.svelte';

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
		<MatrixRain active={showModal} zClass="z-0" />

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
				class="absolute top-0 left-0 w-8 h-8 bg-black hover:bg-black transition-all duration-200 flex items-center justify-center cursor-pointer focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:outline-none group border-r border-b border-terminal-green/30 z-10"
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
			<div class="relative rounded-md border border-terminal-green/50 bg-black/20 px-6 py-4 hidden sm:flex items-center justify-center mb-4 terminal-font text-sm">
				<div class="text-center">
					<div class="text-terminal-green font-bold mb-1">C-137-INFO DEEP ANALYSIS TERMINAL</div>
					<div class="text-terminal-green font-bold">CITADEL DATABASE ACCESS</div>
				</div>
				<div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 max-w-[220px]">
					<p class="text-white/80 text-[10px] leading-tight terminal-font italic text-right">R-really? You're j-j-just gonna do a <span class="text-portal-orange">*b-uuuuurp*</span> matrix thing here? That's pre Y2K lame. Sheesh.</p>
					<img src="/rick-matrix-quote.png" alt="Rick Sanchez" class="w-10 h-14 flex-shrink-0 opacity-90" />
				</div>
			</div>
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 block sm:hidden text-center mb-4 terminal-font text-xs">
				<div class="text-terminal-green font-bold mb-1">C-137-INFO TERMINAL</div>
				<div class="text-terminal-green font-bold">DATABASE ACCESS</div>
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

			<!-- Rick quote - mobile only, full text at bottom -->
			<div class="flex sm:hidden items-center gap-2 mt-4 pt-3 border-t border-terminal-green/20">
				<img src="/rick-matrix-quote.png" alt="Rick Sanchez" class="w-10 h-14 flex-shrink-0 opacity-90" />
				<p class="text-white/80 text-[10px] leading-tight terminal-font italic">R-really? You're j-j-just gonna do a <span class="text-portal-orange">*b-uuuuurp*</span> matrix thing here? That's pre Y2K lame. Sheesh.</p>
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
