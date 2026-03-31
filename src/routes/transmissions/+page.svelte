<script lang="ts">
	import { onMount } from 'svelte';
	import {
		prepareWithSegments,
		layoutNextLine,
		type PreparedTextWithSegments,
		type LayoutLine,
		type LayoutCursor
	} from '@chenglou/pretext';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const TRANSMISSIONS = data.transmissions;

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

	// Cursor repulsion state
	let pointerX = $state(-1000);
	let pointerY = $state(-1000);
	let pointerActive = $state(false);
	const REPULSION_RADIUS = 80;

	const FONT = '14px "JetBrains Mono", monospace';
	const LINE_HEIGHT = 22;
	const PADDING = 24;
	const HEADER_HEIGHT = 140;

	// Compute the horizontal interval blocked by a circle at a given vertical band
	function circleIntervalForBand(
		cx: number,
		cy: number,
		r: number,
		bandTop: number,
		bandBottom: number
	): { left: number; right: number } | null {
		// Check if band overlaps with circle vertically
		if (bandBottom < cy - r || bandTop > cy + r) return null;

		// The widest chord is at the y closest to the circle center
		const closestY = Math.max(bandTop, Math.min(bandBottom, cy));
		const dy = closestY - cy;
		const halfWidth = Math.sqrt(Math.max(0, r * r - dy * dy));

		if (halfWidth <= 0) return null;
		return { left: cx - halfWidth, right: cx + halfWidth };
	}

	// Carve available text slots from blocked intervals (from pretext's wrap-geometry)
	function carveSlots(
		baseLeft: number,
		baseRight: number,
		blocked: { left: number; right: number }[]
	): { left: number; right: number }[] {
		let slots = [{ left: baseLeft, right: baseRight }];
		for (const interval of blocked) {
			const next: { left: number; right: number }[] = [];
			for (const slot of slots) {
				if (interval.right <= slot.left || interval.left >= slot.right) {
					next.push(slot);
					continue;
				}
				if (interval.left > slot.left) next.push({ left: slot.left, right: interval.left });
				if (interval.right < slot.right) next.push({ left: interval.right, right: slot.right });
			}
			slots = next;
		}
		return slots.filter((s) => s.right - s.left >= 24);
	}

	// Layout text line-by-line with cursor avoidance
	function layoutWithAvoidance(
		text: string,
		regionLeft: number,
		regionRight: number,
		startY: number,
		cursorX: number,
		cursorY: number,
		radius: number,
		active: boolean
	): { text: string; x: number; y: number; width: number }[] {
		if (text.length === 0) return [];

		let prepared: PreparedTextWithSegments;
		try {
			prepared = prepareWithSegments(text, FONT);
		} catch {
			return [{ text, x: regionLeft, y: startY, width: regionRight - regionLeft }];
		}

		const lines: { text: string; x: number; y: number; width: number }[] = [];
		let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
		let y = startY;
		let safety = 0;
		let skippedLines = 0;
		const MAX_SKIP = 8; // Max consecutive blank lines before we force layout at full width

		while (safety++ < 200) {
			const bandTop = y - LINE_HEIGHT;
			const bandBottom = y;

			// Determine blocked intervals from cursor
			const blocked: { left: number; right: number }[] = [];
			if (active && radius > 0) {
				const interval = circleIntervalForBand(cursorX, cursorY, radius, bandTop, bandBottom);
				if (interval) blocked.push(interval);
			}

			// Carve available slots
			let slots = carveSlots(regionLeft, regionRight, blocked);

			if (slots.length === 0) {
				skippedLines++;
				if (skippedLines < MAX_SKIP) {
					// Skip this band — cursor blocks it entirely
					y += LINE_HEIGHT;
					continue;
				}
				// Too many skips — fall back to full width so text still renders
				slots = [{ left: regionLeft, right: regionRight }];
			}

			skippedLines = 0;

			// Pick the widest slot
			let bestSlot = slots[0];
			for (let i = 1; i < slots.length; i++) {
				if (slots[i].right - slots[i].left > bestSlot.right - bestSlot.left) {
					bestSlot = slots[i];
				}
			}

			const slotWidth = bestSlot.right - bestSlot.left;
			const line = layoutNextLine(prepared, cursor, slotWidth);
			if (!line) break;

			lines.push({
				text: line.text,
				x: bestSlot.left,
				y,
				width: line.width
			});

			cursor = line.end;
			y += LINE_HEIGHT;

			if (y > canvasHeight - PADDING) break;
		}

		return lines;
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
		activeTransmission =
			(activeTransmission + direction + TRANSMISSIONS.length) % TRANSMISSIONS.length;
		startDecoding();
	}

	function canvasCoords(clientX: number, clientY: number) {
		const rect = canvas.getBoundingClientRect();
		// Map from CSS pixels to our logical canvas coordinate space
		const scaleX = canvasWidth / rect.width;
		const scaleY = canvasHeight / rect.height;
		return {
			x: (clientX - rect.left) * scaleX,
			y: (clientY - rect.top) * scaleY
		};
	}

	function updatePointer(clientX: number, clientY: number) {
		if (!canvas) return;
		const { x, y } = canvasCoords(clientX, clientY);
		pointerX = x;
		pointerY = y;
		pointerActive = true;
	}

	function handlePointerMove(e: PointerEvent) {
		updatePointer(e.clientX, e.clientY);
	}

	function handleMouseMove(e: MouseEvent) {
		updatePointer(e.clientX, e.clientY);
	}

	function handlePointerLeave() {
		pointerActive = false;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!e.touches[0]) return;
		e.preventDefault();
		updatePointer(e.touches[0].clientX, e.touches[0].clientY);
	}

	function handleTouchEnd() {
		pointerActive = false;
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

		// Draw cursor repulsion field
		if (pointerActive) {
			// Outer glow rings
			for (let i = 3; i >= 0; i--) {
				const r = REPULSION_RADIUS + i * 8;
				const alpha = 0.03 + (3 - i) * 0.02;
				ctx.beginPath();
				ctx.arc(pointerX, pointerY, r, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(255, 40, 40, ${alpha})`;
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// Inner portal-like effect
			const portalGrad = ctx.createRadialGradient(
				pointerX,
				pointerY,
				0,
				pointerX,
				pointerY,
				REPULSION_RADIUS
			);
			portalGrad.addColorStop(0, 'rgba(255, 60, 60, 0.14)');
			portalGrad.addColorStop(0.4, 'rgba(200, 20, 20, 0.08)');
			portalGrad.addColorStop(0.7, 'rgba(150, 0, 0, 0.04)');
			portalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
			ctx.fillStyle = portalGrad;
			ctx.beginPath();
			ctx.arc(pointerX, pointerY, REPULSION_RADIUS, 0, Math.PI * 2);
			ctx.fill();

			// Crosshair
			ctx.strokeStyle = 'rgba(255, 40, 40, 0.45)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(pointerX - 12, pointerY);
			ctx.lineTo(pointerX + 12, pointerY);
			ctx.moveTo(pointerX, pointerY - 12);
			ctx.lineTo(pointerX, pointerY + 12);
			ctx.stroke();
		}

		// Get the decoded portion of text
		const fullText = tx.text;
		const visibleText = fullText.slice(0, decodedChars);

		// Use pretext with cursor avoidance layout
		if (visibleText.length > 0 && signalWidth - PADDING * 2 > 40) {
			const lines = layoutWithAvoidance(
				visibleText,
				PADDING,
				signalWidth - PADDING,
				HEADER_HEIGHT,
				pointerX,
				pointerY,
				REPULSION_RADIUS,
				pointerActive
			);

			ctx.font = FONT;
			ctx.fillStyle = '#00ff41';
			ctx.shadowColor = 'rgba(0, 255, 65, 0.5)';
			ctx.shadowBlur = 4;

			lines.forEach((line) => {
				if (line.y > canvasHeight - PADDING) return;

				// Slight per-line noise displacement for "signal interference"
				const noiseX = signalNoise > 0 ? (Math.random() - 0.5) * signalNoise * 3 : 0;
				const noiseAlpha =
					signalNoise > 0 ? Math.max(0.3, 1 - Math.random() * signalNoise * 0.02) : 1;

				// Proximity glow — lines near cursor get a color shift
				let fillColor = '#00ff41';
				if (pointerActive) {
					const lineCenterY = line.y - LINE_HEIGHT / 2;
					const dist = Math.sqrt(
						Math.pow(line.x + line.width / 2 - pointerX, 2) + Math.pow(lineCenterY - pointerY, 2)
					);
					if (dist < REPULSION_RADIUS * 2) {
						const t = Math.max(0, 1 - dist / (REPULSION_RADIUS * 2));
						// Shift toward cyan/blue near the cursor
						const r = Math.round(0 + t * 77);
						const g = Math.round(255 - t * 84);
						const b = Math.round(65 + t * 182);
						fillColor = `rgb(${r}, ${g}, ${b})`;
						ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
					}
				}

				ctx.fillStyle = fillColor;
				ctx.globalAlpha = noiseAlpha;
				ctx.fillText(line.text, line.x + noiseX, line.y);
			});

			ctx.shadowBlur = 0;
			ctx.shadowColor = 'rgba(0, 255, 65, 0.5)';
			ctx.globalAlpha = 1;

			// Blinking cursor
			if (decoding && Math.floor(Date.now() / 400) % 2 === 0) {
				const lastLine = lines[lines.length - 1];
				if (lastLine) {
					ctx.fillStyle = '#00ff41';
					ctx.fillRect(lastLine.x + lastLine.width + 2, lastLine.y - 12, 8, 16);
				}
			}

			// Line count / height stats
			ctx.font = '10px "JetBrains Mono", monospace';
			ctx.fillStyle = '#ffffff';
			ctx.globalAlpha = 0.85;
			const statsY = canvasHeight - 14;
			ctx.fillText(
				`LINES: ${lines.length} | CHARS: ${decodedChars}/${fullText.length} | AVOIDANCE: ${pointerActive ? 'ACTIVE' : 'IDLE'} | layoutNextLine()`,
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
			canvasWidth / 2,
			canvasHeight / 2,
			canvasHeight * 0.3,
			canvasWidth / 2,
			canvasHeight / 2,
			canvasHeight * 0.8
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
				canvasHeight = Math.max(400, Math.min(650, window.innerHeight * 0.6));
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
		class="text-terminal-green mb-6 overflow-x-auto font-mono text-xs sm:text-sm"
		style="text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);"
	>
		<pre>{`
> INTERDIMENSIONAL SIGNAL INTERCEPTOR
> SYS_ID: ${$weirdWord.toUpperCase()}
> STATUS: [SCANNING ALL FREQUENCIES]
> LAYOUT ENGINE: @chenglou/pretext
> TRANSMISSIONS FOUND: ${TRANSMISSIONS.length}`}</pre>
		<div class="text-terminal-red animate-pulse">
			<pre>{`> REPULSION FIELD: MOVE (OR CLICK AND MOVE) CURSOR OVER TRANSMISSION`}</pre>
		</div>
	</div>

	<!-- Canvas Container -->
	<div
		bind:this={containerEl}
		class="terminal-border relative mb-6 overflow-hidden rounded-lg"
		style="background: #0a0a0a; touch-action: none;"
	>
		<canvas
			bind:this={canvas}
			width={canvasWidth}
			height={canvasHeight}
			style="width: 100%; height: {canvasHeight}px; display: block; cursor: none;"
			onpointermove={handlePointerMove}
			onpointerenter={handlePointerMove}
			onpointerleave={handlePointerLeave}
			onmousemove={handleMouseMove}
			onmouseleave={handlePointerLeave}
			ontouchmove={handleTouchMove}
			ontouchstart={handleTouchMove}
			ontouchend={handleTouchEnd}
		></canvas>
	</div>

	<!-- Controls -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Signal Bandwidth Slider -->
		<div class="terminal-border rounded-lg p-4">
			<label class="text-terminal-green mb-2 block font-mono text-xs" for="bandwidth-slider">
				SIGNAL BANDWIDTH: <span class="text-cyan-400">{signalWidth}px</span>
				<span class="text-terminal-green/50 ml-2">(drag to reflow text in real-time)</span>
			</label>
			<input
				id="bandwidth-slider"
				type="range"
				min="200"
				max={canvasWidth - 40}
				bind:value={signalWidth}
				class="w-full accent-green-500"
			/>
			<p class="text-terminal-green/50 mt-2 font-mono text-xs">
				pretext recalculates line breaks at ~0.09ms per layout pass
			</p>
		</div>

		<!-- Signal Noise -->
		<div class="terminal-border rounded-lg p-4">
			<label class="text-terminal-green mb-2 block font-mono text-xs" for="noise-slider">
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
			<p class="text-terminal-green/50 mt-2 font-mono text-xs">
				Simulated dimensional static displacement
			</p>
		</div>
	</div>

	<!-- Transmission Selector -->
	<div class="terminal-border mt-6 rounded-lg p-4">
		<div class="text-terminal-green/60 mb-3 font-mono text-xs">
			TRANSMISSION {activeTransmission + 1} OF {TRANSMISSIONS.length}
		</div>
		<div class="flex flex-wrap gap-2">
			{#each TRANSMISSIONS as tx, i}
				<button
					class="cursor-pointer rounded border px-3 py-1.5 font-mono text-xs transition-all {i ===
					activeTransmission
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
	<div class="text-terminal-green/40 mt-6 text-center font-mono text-xs">
		Text measurement & layout powered by
		<a
			href="https://github.com/chenglou/pretext"
			target="_blank"
			rel="noopener noreferrer"
			class="text-cyan-600 underline hover:text-cyan-400">@chenglou/pretext</a
		>
		&mdash; zero-reflow text layout with cursor avoidance via layoutNextLine()
	</div>
</div>
