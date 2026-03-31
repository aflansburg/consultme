<script lang="ts">
	import { onMount } from 'svelte';
	import { prepareWithSegments, layoutWithLines, type LayoutLine } from '@chenglou/pretext';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import SEO from '$lib/components/SEO.svelte';

	const TRANSMISSIONS = [
		{
			dimension: 'C-137',
			sender: 'RICK SANCHEZ',
			priority: 'URGENT',
			text: `Morty, if you're reading this on some interdimensional terminal, stop touching things. The portal gun's calibration is off by 0.003 Flurbos and I need you to not panic. Also, tell Jerry he still owes me for that Meeseeks incident.`
		},
		{
			dimension: 'J-19 Zeta 7',
			sender: 'DOOFUS RICK',
			priority: 'LOW',
			text: `Hello friends! I just wanted to share my latest ovenless brownie recipe. Mix two cups of dark matter flour with one Plumbus worth of vanilla extract. Bake at the temperature of a dying star for approximately twelve Glorpons. They turn out wonderful every time!`
		},
		{
			dimension: 'C-500A',
			sender: 'UNKNOWN ENTITY',
			priority: 'CRITICAL',
			text: `WARNING: Dimensional breach detected in sectors 7-G through 12-F. All Ricks evacuate immediately. The Citadel defense grid is compromised. Repeat: the Citadel defense grid is compromised. Evil Morty was right. We should have listened.`
		},
		{
			dimension: 'Dimension 35-C',
			sender: 'BIRDPERSON',
			priority: 'STANDARD',
			text: `It has been a long time, old friend. In bird culture, failing to respond to an interdimensional transmission is considered a dick move. The Galactic Federation has fallen. Tammy is gone. I am free. Wubba lubba dub dub, as you would say. Though I know what it really means.`
		},
		{
			dimension: '5-126',
			sender: 'COUNCIL OF RICKS',
			priority: 'CLASSIFIED',
			text: `ENCRYPTED TRANSMISSION: All Rick variants are hereby notified that Operation Phoenix has been reinstated across all known dimensions. Clone backup protocol Theta-9 is now mandatory. Any Rick found without a backup body will be reassigned to the Blender Dimension. This is not a drill. Probably.`
		},
		{
			dimension: 'Cronenberg World',
			sender: 'SUMMER SMITH',
			priority: 'DISTRESS',
			text: `If anyone can hear this, we're still alive down here. Grandpa Rick and Morty abandoned this dimension after they Cronenberged everything. We've adapted. Dad actually became useful for once — turns out fighting mutants is the one thing Jerry's good at. Send help. Or don't. We're honestly doing fine.`
		},
		{
			dimension: 'Microverse',
			sender: 'ZEEP XANFLORP',
			priority: 'SCIENTIFIC',
			text: `To the being who created our universe to power his vehicle: I know what you did. My teenyverse has confirmed the recursive nature of our reality. Each layer powers the one above it. It's slavery with extra steps, and I am publishing my findings across all miniverse academic journals. Your move, "Rick."`
		}
	];

	let canvas: HTMLCanvasElement;
	let containerEl: HTMLDivElement;
	let signalWidth = $state(600);
	let activeTransmission = $state(0);
	let decoding = $state(false);
	let decodedChars = $state(0);
	let scanlineOffset = $state(0);
	let signalNoise = $state(0);
	let canvasWidth = $state(800);
	let canvasHeight = $state(600);
	let animFrame: number;
	let decodeInterval: ReturnType<typeof setInterval>;
	let mounted = $state(false);

	const FONT = '14px "JetBrains Mono", monospace';
	const LINE_HEIGHT = 22;
	const PADDING = 24;
	const HEADER_HEIGHT = 140;

	function getLines(text: string, maxWidth: number): LayoutLine[] {
		try {
			const prepared = prepareWithSegments(text, FONT);
			const result = layoutWithLines(prepared, maxWidth, LINE_HEIGHT);
			return result.lines;
		} catch {
			return [{ text, width: maxWidth, start: { segmentIndex: 0, graphemeIndex: 0 }, end: { segmentIndex: 0, graphemeIndex: text.length } }];
		}
	}

	function startDecoding() {
		if (decoding) return;
		decoding = true;
		decodedChars = 0;
		const fullText = TRANSMISSIONS[activeTransmission].text;
		const totalChars = fullText.length;

		if (decodeInterval) clearInterval(decodeInterval);
		decodeInterval = setInterval(() => {
			decodedChars += 2;
			if (decodedChars >= totalChars) {
				decodedChars = totalChars;
				decoding = false;
				clearInterval(decodeInterval);
			}
		}, 18);
	}

	function cycleTransmission(direction: number) {
		if (decodeInterval) clearInterval(decodeInterval);
		decoding = false;
		decodedChars = 0;
		activeTransmission = (activeTransmission + direction + TRANSMISSIONS.length) % TRANSMISSIONS.length;
		startDecoding();
	}

	function drawCanvas() {
		if (!canvas || !mounted) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = canvasWidth * dpr;
		canvas.height = canvasHeight * dpr;
		ctx.scale(dpr, dpr);

		// Background
		ctx.fillStyle = '#0a0a0a';
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Subtle grid
		ctx.strokeStyle = 'rgba(0, 255, 65, 0.04)';
		ctx.lineWidth = 1;
		for (let x = 0; x < canvasWidth; x += 20) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvasHeight);
			ctx.stroke();
		}
		for (let y = 0; y < canvasHeight; y += 20) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvasWidth, y);
			ctx.stroke();
		}

		const tx = TRANSMISSIONS[activeTransmission];
		const availableWidth = signalWidth - PADDING * 2;

		// Header area
		ctx.font = '11px "JetBrains Mono", monospace';
		ctx.fillStyle = '#00ff41';
		ctx.globalAlpha = 0.6;
		ctx.fillText(`INTERDIMENSIONAL SIGNAL INTERCEPTOR v2.${activeTransmission}7`, PADDING, 28);

		ctx.globalAlpha = 1;
		ctx.font = '10px "JetBrains Mono", monospace';
		ctx.fillStyle = '#4dabf7';
		ctx.fillText(`DIMENSION: ${tx.dimension}`, PADDING, 52);
		ctx.fillText(`SENDER: ${tx.sender}`, PADDING, 68);

		// Priority with color coding
		const priorityColors: Record<string, string> = {
			URGENT: '#fd7e14',
			LOW: '#51cf66',
			CRITICAL: '#ff0040',
			STANDARD: '#4dabf7',
			CLASSIFIED: '#be4bdb',
			DISTRESS: '#ff6b6b',
			SCIENTIFIC: '#67e8f9'
		};
		ctx.fillStyle = priorityColors[tx.priority] || '#00ff41';
		ctx.fillText(`PRIORITY: ${tx.priority}`, PADDING, 84);

		// Signal bandwidth indicator
		ctx.fillStyle = '#00ff41';
		ctx.globalAlpha = 0.3;
		ctx.fillText(`BANDWIDTH: ${signalWidth}px | LAYOUT ENGINE: @chenglou/pretext`, PADDING, 100);
		ctx.globalAlpha = 1;

		// Separator line
		ctx.strokeStyle = '#00ff41';
		ctx.globalAlpha = 0.4;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(PADDING, 112);
		ctx.lineTo(signalWidth - PADDING, 112);
		ctx.stroke();
		ctx.globalAlpha = 1;

		// Signal boundary lines
		ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(signalWidth, 0);
		ctx.lineTo(signalWidth, canvasHeight);
		ctx.stroke();
		ctx.setLineDash([]);

		// Get the decoded portion of text
		const fullText = tx.text;
		const visibleText = fullText.slice(0, decodedChars);

		// Use pretext to lay out the visible text
		if (visibleText.length > 0 && availableWidth > 40) {
			const lines = getLines(visibleText, availableWidth);

			ctx.font = FONT;
			ctx.fillStyle = '#00ff41';
			ctx.shadowColor = 'rgba(0, 255, 65, 0.5)';
			ctx.shadowBlur = 4;

			lines.forEach((line, i) => {
				const y = HEADER_HEIGHT + i * LINE_HEIGHT;
				if (y > canvasHeight - PADDING) return;

				// Slight per-line noise displacement for "signal interference"
				const noiseX = signalNoise > 0 ? (Math.random() - 0.5) * signalNoise * 3 : 0;
				const noiseAlpha = signalNoise > 0 ? Math.max(0.3, 1 - Math.random() * signalNoise * 0.02) : 1;

				ctx.globalAlpha = noiseAlpha;
				ctx.fillText(line.text, PADDING + noiseX, y);
			});

			ctx.shadowBlur = 0;
			ctx.globalAlpha = 1;

			// Blinking cursor
			if (decoding && Math.floor(Date.now() / 400) % 2 === 0) {
				const lastLine = lines[lines.length - 1];
				if (lastLine) {
					const cursorY = HEADER_HEIGHT + (lines.length - 1) * LINE_HEIGHT;
					const cursorX = PADDING + lastLine.width;
					ctx.fillStyle = '#00ff41';
					ctx.fillRect(cursorX + 2, cursorY - 12, 8, 16);
				}
			}

			// Line count / height stats
			ctx.font = '10px "JetBrains Mono", monospace';
			ctx.fillStyle = '#4dabf7';
			ctx.globalAlpha = 0.5;
			const statsY = canvasHeight - 14;
			ctx.fillText(
				`LINES: ${lines.length} | HEIGHT: ${lines.length * LINE_HEIGHT}px | CHARS: ${decodedChars}/${fullText.length} | REFLOWS: realtime`,
				PADDING,
				statsY
			);
			ctx.globalAlpha = 1;
		}

		// Scanline effect
		ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
		for (let y = scanlineOffset; y < canvasHeight; y += 3) {
			ctx.fillRect(0, y, canvasWidth, 1);
		}

		// Vignette
		const gradient = ctx.createRadialGradient(
			canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.3,
			canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.8
		);
		gradient.addColorStop(0, 'rgba(0,0,0,0)');
		gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Animate
		scanlineOffset = (scanlineOffset + 1) % 3;
		animFrame = requestAnimationFrame(drawCanvas);
	}

	onMount(() => {
		mounted = true;

		function updateSize() {
			if (containerEl) {
				canvasWidth = containerEl.clientWidth;
				canvasHeight = Math.max(400, Math.min(600, window.innerHeight * 0.55));
				if (signalWidth > canvasWidth - 40) {
					signalWidth = canvasWidth - 40;
				}
			}
		}

		updateSize();
		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(containerEl);

		startDecoding();
		animFrame = requestAnimationFrame(drawCanvas);

		return () => {
			resizeObserver.disconnect();
			cancelAnimationFrame(animFrame);
			if (decodeInterval) clearInterval(decodeInterval);
		};
	});
</script>

<SEO
	title="Interdimensional Transmissions | Signal Interceptor"
	description="Intercepted interdimensional transmissions decoded using advanced text layout algorithms. Powered by @chenglou/pretext."
	keywords="interdimensional transmissions, pretext, text layout, Rick and Morty"
	canonical="https://engabe.com/transmissions"
/>

<div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
	<!-- ASCII Art Header -->
	<div
		class="mb-6 overflow-x-auto font-mono text-xs text-terminal-green sm:text-sm"
		style="text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);"
	>
		<pre>{`
> INTERDIMENSIONAL SIGNAL INTERCEPTOR
> SYS_ID: ${$weirdWord.toUpperCase()}
> STATUS: [SCANNING ALL FREQUENCIES]
> LAYOUT ENGINE: @chenglou/pretext
> TRANSMISSIONS FOUND: ${TRANSMISSIONS.length}`}</pre>
	</div>

	<!-- Canvas Container -->
	<div
		bind:this={containerEl}
		class="relative mb-6 overflow-hidden rounded-lg terminal-border"
		style="background: #0a0a0a;"
	>
		<canvas
			bind:this={canvas}
			width={canvasWidth}
			height={canvasHeight}
			style="width: 100%; height: {canvasHeight}px; display: block;"
		></canvas>
	</div>

	<!-- Controls -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Signal Bandwidth Slider -->
		<div class="terminal-border rounded-lg p-4">
			<label class="mb-2 block font-mono text-xs text-terminal-green" for="bandwidth-slider">
				SIGNAL BANDWIDTH: <span class="text-cyan-400">{signalWidth}px</span>
				<span class="ml-2 text-terminal-green/50">(drag to reflow text in real-time)</span>
			</label>
			<input
				id="bandwidth-slider"
				type="range"
				min="200"
				max={canvasWidth - 40}
				bind:value={signalWidth}
				class="w-full accent-green-500"
			/>
			<p class="mt-2 font-mono text-xs text-terminal-green/50">
				pretext recalculates line breaks at ~0.09ms per layout pass
			</p>
		</div>

		<!-- Signal Noise -->
		<div class="terminal-border rounded-lg p-4">
			<label class="mb-2 block font-mono text-xs text-terminal-green" for="noise-slider">
				SIGNAL INTERFERENCE: <span class="text-portal-orange">{signalNoise}%</span>
			</label>
			<input
				id="noise-slider"
				type="range"
				min="0"
				max="100"
				bind:value={signalNoise}
				class="w-full accent-orange-500"
			/>
			<p class="mt-2 font-mono text-xs text-terminal-green/50">
				Simulated dimensional static displacement
			</p>
		</div>
	</div>

	<!-- Transmission Selector -->
	<div class="mt-6 terminal-border rounded-lg p-4">
		<div class="mb-3 font-mono text-xs text-terminal-green/60">
			TRANSMISSION {activeTransmission + 1} OF {TRANSMISSIONS.length}
		</div>
		<div class="flex flex-wrap gap-2">
			{#each TRANSMISSIONS as tx, i}
				<button
					class="cursor-pointer rounded border px-3 py-1.5 font-mono text-xs transition-all {i === activeTransmission
						? 'border-green-500 bg-green-500/20 text-green-400'
						: 'border-zinc-700 bg-zinc-900/50 text-zinc-500 hover:border-green-700 hover:text-green-600'}"
					onclick={() => cycleTransmission(i - activeTransmission)}
				>
					{tx.dimension}
				</button>
			{/each}
		</div>
		<div class="mt-3 flex items-center gap-4">
			<button
				class="terminal-button cursor-pointer rounded border border-green-700 bg-green-900/30 px-4 py-1.5 font-mono text-xs text-green-400 transition-all hover:border-green-500 hover:bg-green-800/40"
				onclick={() => cycleTransmission(-1)}
			>
				&lt; PREV
			</button>
			<button
				class="terminal-button cursor-pointer rounded border border-green-700 bg-green-900/30 px-4 py-1.5 font-mono text-xs text-green-400 transition-all hover:border-green-500 hover:bg-green-800/40"
				onclick={() => cycleTransmission(1)}
			>
				NEXT &gt;
			</button>
			<button
				class="terminal-button cursor-pointer rounded border border-cyan-700 bg-cyan-900/30 px-4 py-1.5 font-mono text-xs text-cyan-400 transition-all hover:border-cyan-500 hover:bg-cyan-800/40"
				onclick={() => {
					if (decodeInterval) clearInterval(decodeInterval);
					decodedChars = 0;
					decoding = false;
					startDecoding();
				}}
			>
				RE-DECODE
			</button>
		</div>
	</div>

	<!-- Tech Attribution -->
	<div class="mt-6 font-mono text-xs text-terminal-green/40 text-center">
		Text measurement & layout powered by
		<a
			href="https://github.com/chenglou/pretext"
			target="_blank"
			rel="noopener noreferrer"
			class="text-cyan-600 underline hover:text-cyan-400"
		>@chenglou/pretext</a>
		&mdash; zero-reflow text layout engine
	</div>
</div>
