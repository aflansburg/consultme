<script lang="ts">
	import { onMount } from 'svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { bootSequenceStore } from '$lib/stores/bootSequenceStore.svelte';

	let showBootSequence = $state(bootSequenceStore.shouldShowBootSequence);
	let bootLines = $state<string[]>([]);
	let currentLine = $state(0);

	const bootSequenceLines = [
		'[  0.000000] Initializing C-137-INFO System...',
		'[  0.123456] Loading interdimensional protocols...',
		'[  0.234567] Scanning multiverse databases... OK',
		'[  0.345678] Citadel connection established... OK',
		'[  0.456789] Rick & Morty character API online... OK',
		'[  0.567890] Portal gun targeting system... CALIBRATED',
		'[  0.678901] Weird word generator... INITIALIZED',
		`[  0.789012] System designation: ${$weirdWord}`,
		'[  0.890123] Pattern recognition modules... LOADED',
		'[  0.901234] Engineering humor database... READY',
		'[  1.012345] Autism-positive language pack... ACTIVE',
		'[  1.123456] Loading user interface...',
		'[  1.234567] C-137-INFO Terminal ready for operation.',
		'[  1.345678] Welcome, interdimensional visitor.',
		'',
		'> _'
	];

	onMount(() => {
		// If we shouldn't show the boot sequence, exit early
		if (!showBootSequence) {
			return;
		}

		const interval = setInterval(() => {
			if (currentLine < bootSequenceLines.length) {
				bootLines = [...bootLines, bootSequenceLines[currentLine]];
				currentLine++;
			} else {
				clearInterval(interval);
				setTimeout(() => {
					showBootSequence = false;
					// Mark as viewed so it won't show again
					bootSequenceStore.markAsViewed();
				}, 2000);
			}
		}, 200);

		return () => clearInterval(interval);
	});
</script>

{#if showBootSequence}
	<div class="fixed inset-0 bg-black z-[9999] flex items-center justify-center terminal-font">
		<div class="w-full max-w-4xl p-3 sm:p-8">
			<!-- Mobile Header -->
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 mb-4 block sm:hidden terminal-font text-xs">
				<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO SYSTEM</div>
				<div class="text-terminal-green font-bold text-center">Data Access Terminal v2.4.1</div>
			</div>
			<!-- Desktop Header -->
			<div class="rounded-md border border-terminal-green/50 bg-black/20 px-6 py-4 mb-8 hidden sm:block terminal-font text-sm">
				<div class="text-terminal-green font-bold text-center mb-2">C-137-INFO SYSTEM</div>
				<div class="text-terminal-green font-bold text-center mb-1">Interdimensional Data Access Terminal</div>
				<div class="text-terminal-green font-bold text-center">Version 2.4.1</div>
			</div>
			<div class="text-green-400 space-y-1 flex flex-col items-center">
				<div class="text-left">
					{#each bootLines as line}
						<div class="animate-fadeIn">
							{line}
							{#if line.endsWith('> _')}
								<span class="animate-pulse">|</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}
</style>