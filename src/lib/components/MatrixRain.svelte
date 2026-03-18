<script lang="ts">
	interface Props {
		active: boolean;
		onClose?: () => void;
		/** z-index class, defaults to z-[9999] */
		zClass?: string;
		/** Show random floating GIF images over the rain */
		showImages?: boolean;
	}

	let {
		active,
		onClose,
		zClass = 'z-[9999]',
		showImages = false
	}: Props = $props();

	let canvas: HTMLCanvasElement | undefined;
	let animationId: number;

	// Matrix rain character sets
	const RUNES = 'ᛒᛏᛈᚹᚱᚨᚦᚢᚠᚷᚺᛃᛇᛉᛊᛋᛚᛗᛜᛝᛞᛟ';
	const KATAKANA = 'アイウエオカキクケコサシスセソタチツテト';
	const BINARY = '01';
	const KEYWORDS = ['C137', 'RICK', 'MORTY', 'PORTAL'];
	const ALL_CHARS = RUNES + KATAKANA + BINARY;

	// Floating GIF images
	const MATRIX_GIFS = [
		'/images/matrix/falling-jerry.gif',
		'/images/matrix/mr-poopy-b.gif',
		'/images/matrix/pickle-rick.gif',
		'/images/matrix/rick-sanchez.gif'
	];

	interface FallingImage {
		id: number;
		src: string;
		x: number;
		duration: number;
		delay: number;
		rotation: number;
	}

	let fallingImages = $state<FallingImage[]>([]);
	let imageCounter = 0;
	let imageInterval: ReturnType<typeof setInterval>;

	function spawnImage() {
		if (fallingImages.length >= 6) return;

		const padding = 60;
		const img: FallingImage = {
			id: imageCounter++,
			src: MATRIX_GIFS[Math.floor(Math.random() * MATRIX_GIFS.length)],
			x: padding + Math.random() * (window.innerWidth - padding * 2),
			duration: 6 + Math.random() * 6,
			delay: 0,
			rotation: -20 + Math.random() * 40
		};

		fallingImages = [...fallingImages, img];

		// Remove after it falls off screen
		setTimeout(() => {
			fallingImages = fallingImages.filter(fi => fi.id !== img.id);
		}, img.duration * 1000 + 500);
	}

	function startImages() {
		imageCounter = 0;
		fallingImages = [];
		setTimeout(spawnImage, 500);
		imageInterval = setInterval(() => {
			spawnImage();
		}, 2000 + Math.random() * 2000);
	}

	function stopImages() {
		if (imageInterval) clearInterval(imageInterval);
		fallingImages = [];
	}

	interface Column {
		x: number;
		y: number;
		speed: number;
		chars: string[];
		trailLength: number;
	}

	let columns: Column[] = [];

	function randomChar(): string {
		if (Math.random() < 0.02) {
			const kw = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
			return kw[0];
		}
		return ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
	}

	function initColumns(width: number, height: number) {
		const colSpacing = 10;
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

				if (Math.random() < 0.03) {
					col.chars[i] = randomChar();
				}

				if (i === 0) {
					ctx.fillStyle = '#ffffff';
				} else if (i < 3) {
					ctx.fillStyle = 'rgba(0, 255, 65, 0.85)';
				} else {
					const progress = i / col.trailLength;
					const alpha = Math.max(0.08, (1 - progress) * 0.65);
					ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
				}

				ctx.fillText(col.chars[i], col.x, charY);
			}

			col.y += col.speed;

			if (col.y - col.trailLength * fontSize > height) {
				col.y = Math.random() * -200;
				col.speed = 1 + Math.random() * 3;
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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onClose) {
			onClose();
		}
	}

	$effect(() => {
		if (active && canvas) {
			startMatrix();
			window.addEventListener('resize', handleResize);
			window.addEventListener('keydown', handleKeydown);
			if (showImages) startImages();
		}
		return () => {
			if (animationId) cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('keydown', handleKeydown);
			stopImages();
		};
	});
</script>

{#if active}
	<div class="fixed inset-0 {zClass}">
		<canvas
			bind:this={canvas}
			class="fixed inset-0 w-full h-full"
		></canvas>
		{#if showImages}
			<div class="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
				{#each fallingImages as img (img.id)}
					<img
						src={img.src}
						alt=""
						class="matrix-falling-img"
						style="left: {img.x}px; animation-duration: {img.duration}s; transform: rotate({img.rotation}deg);"
					/>
				{/each}
			</div>
		{/if}
		{#if onClose}
			<button
				class="fixed inset-0 w-full h-full cursor-pointer bg-transparent z-10"
				onclick={onClose}
				aria-label="Close matrix rain"
			></button>
		{/if}
	</div>
{/if}

<style>
	.matrix-falling-img {
		position: absolute;
		top: -80px;
		width: 96px;
		height: 96px;
		object-fit: contain;
		pointer-events: none;
		filter: drop-shadow(0 0 8px rgba(0, 255, 65, 0.6));
		animation-name: matrix-fall;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	@keyframes matrix-fall {
		0% {
			top: -120px;
			opacity: 0;
		}
		5% {
			opacity: 0.85;
		}
		90% {
			opacity: 0.85;
		}
		100% {
			top: 110vh;
			opacity: 0;
		}
	}

	@media (min-width: 640px) {
		.matrix-falling-img {
			width: 100px;
			height: 100px;
		}
	}

	@media (min-width: 1024px) {
		.matrix-falling-img {
			width: 120px;
			height: 120px;
		}
	}
</style>
