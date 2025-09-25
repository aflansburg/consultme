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
			<!-- Mobile ASCII Header -->
			<div class="ascii-art text-center mb-4 block sm:hidden">
╔══════════════════════════════════════════╗
║           C-137-INFO SYSTEM              ║
║      Data Access Terminal v2.4.1         ║
╚══════════════════════════════════════════╝
			</div>
			<!-- Desktop ASCII Header -->
			<div class="ascii-art text-center mb-8 hidden sm:block">
╔═══════════════════════════════════════════════════════════╗
║                    C-137-INFO SYSTEM                      ║
║           Interdimensional Data Access Terminal           ║
║                     Version 2.4.1                         ║
╚═══════════════════════════════════════════════════════════╝
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