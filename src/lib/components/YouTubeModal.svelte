<script lang="ts">
	interface Props {
		videoId: string;
		isOpen: boolean;
		onClose: () => void;
	}

	let { videoId, isOpen, onClose }: Props = $props();

	// Function to extract embed URL from various YouTube formats
	function getEmbedUrl(videoId: string): string {
		// If it's already a video ID (11 characters), use it directly
		if (videoId.length === 11 && !videoId.includes('/')) {
			return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
		}

		// Handle full YouTube URLs
		try {
			const url = new URL(videoId.startsWith('http') ? videoId : `https://${videoId}`);

			// Handle clips: https://youtube.com/clip/UgkxWiYgJiMY0s4-7BZIff6woAjKi9FQy5-R
			if (url.pathname.startsWith('/clip/')) {
				const clipId = url.pathname.replace('/clip/', '');
				// For clips, we embed them directly using the clip ID
				return `https://www.youtube.com/embed/${clipId}?autoplay=1&rel=0&modestbranding=1&clip=${clipId}&showinfo=0&controls=0`;
			}

			// Handle regular videos: https://www.youtube.com/watch?v=VIDEO_ID
			const videoIdFromUrl = url.searchParams.get('v');
			if (videoIdFromUrl) {
				const timestamp = url.searchParams.get('t');
				let embedUrl = `https://www.youtube.com/embed/${videoIdFromUrl}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=0`;
				if (timestamp) {
					embedUrl += `&start=${timestamp}`;
				}
				return embedUrl;
			}

			// Handle youtu.be short URLs
			if (url.hostname === 'youtu.be') {
				const shortVideoId = url.pathname.slice(1); // Remove leading slash
				const timestamp = url.searchParams.get('t');
				let embedUrl = `https://www.youtube.com/embed/${shortVideoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=0`;
				if (timestamp) {
					embedUrl += `&start=${timestamp}`;
				}
				return embedUrl;
			}
		} catch (error) {
			console.warn('Invalid YouTube URL, using as video ID:', videoId);
		}

		// Fallback: treat as video ID
		return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
	}

	let embedUrl = $derived(getEmbedUrl(videoId));

	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			onClose();
		}
	}

	// Handle backdrop click
	function handleBackdropClick() {
		onClose();
	}

</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="youtube-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="youtube-modal-title"
		tabindex="-1"
	>
		<!-- Terminal-style data streams for ambiance -->
		<div class="data-stream" style="left: 2%; animation-delay: 0s;">LOADING_VIDEO_FEED...</div>
		<div class="data-stream" style="left: 8%; animation-delay: 0.5s;">01011001 01010100</div>
		<div class="data-stream" style="left: 15%; animation-delay: 1s;">YOUTUBE_API_ACTIVE</div>
		<div class="data-stream" style="left: 25%; animation-delay: 1.5s;">BANDWIDTH_OPTIMAL</div>
		<div class="data-stream" style="left: 35%; animation-delay: 2s;">HD_STREAM_ENABLED</div>
		<div class="data-stream" style="left: 45%; animation-delay: 2.5s;">AUDIO_SYNC_OK</div>
		<div class="data-stream" style="left: 55%; animation-delay: 3s;">BUFFER_COMPLETE</div>
		<div class="data-stream" style="left: 65%; animation-delay: 0.8s;">VIDEO_CODEC_H264</div>
		<div class="data-stream" style="left: 75%; animation-delay: 1.3s;">FRAME_RATE_60FPS</div>
		<div class="data-stream" style="left: 85%; animation-delay: 1.8s;">PLAYBACK_READY</div>
		<div class="data-stream" style="left: 92%; animation-delay: 2.3s;">STREAM_ACTIVE</div>

		<!-- Modal Container -->
		<div
			class="youtube-modal-container relative w-full max-w-7xl mx-auto animate-slide-up"
			role="document"
		>
			<!-- Terminal-style header -->
			<div class="youtube-header mb-4 text-center">
				<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 mb-2 terminal-font text-xs sm:text-sm">
					<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO VIDEO TERMINAL</div>
					<div class="text-terminal-green font-bold text-center">INTERDIMENSIONAL FEED</div>
				</div>
				<h2 id="youtube-modal-title" class="text-terminal-green font-bold text-lg sm:text-xl terminal-font">
					> ACCESSING_VIDEO_STREAM...
				</h2>
			</div>

			<!-- Close button -->
			<button
				onclick={onClose}
				class="absolute -top-6 right-0 z-10 terminal-button-close w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
				aria-label="Close video"
				title="Close video (ESC)"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-terminal-green"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<!-- Video Container -->
			<div class="youtube-video-container relative w-full terminal-border bg-black/95 rounded-lg overflow-hidden">
				<!-- Aspect ratio container for responsive video -->
				<div class="relative w-full pb-[56.25%]"> <!-- 16:9 aspect ratio -->
					<iframe
						src={embedUrl}
						title="YouTube video player"
						class="absolute inset-0 w-full h-full"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
					></iframe>
				</div>
			</div>

			<!-- Terminal-style footer info -->
			<div class="youtube-footer mt-4 text-center">
				<div class="rounded-md border border-terminal-green/30 bg-black/10 px-3 py-2 terminal-font text-xs">
					<div class="text-terminal-green/60">STREAM_STATUS: ACTIVE | QUALITY: AUTO | ESC_TO_CLOSE</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.youtube-modal-overlay {
		animation: fadeIn 0.3s ease-out forwards;
	}

	.animate-slide-up {
		animation: slideUp 0.4s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(30px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.terminal-button-close {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2));
		border: 1px solid rgba(34, 197, 94, 0.3);
		backdrop-filter: blur(8px);
	}

	.terminal-button-close:hover {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.3));
		border-color: rgba(34, 197, 94, 0.6);
		box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
	}

	/* Data stream animation matching the main app */
	.data-stream {
		position: absolute;
		top: 0;
		font-family: 'Courier New', monospace;
		font-size: 0.6rem;
		color: rgba(34, 197, 94, 0.4);
		white-space: nowrap;
		animation: matrix-fall 8s linear infinite;
		pointer-events: none;
		z-index: 1;
	}

	@keyframes matrix-fall {
		0% {
			top: -20px;
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			top: 100vh;
			opacity: 0;
		}
	}

	/* YouTube video container styling */
	.youtube-video-container {
		box-shadow:
			0 0 20px rgba(34, 197, 94, 0.2),
			inset 0 0 20px rgba(0, 0, 0, 0.5);
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.youtube-header h2 {
			font-size: 1rem;
		}

		.terminal-button-close {
			width: 2.5rem;
			height: 2.5rem;
		}

		.terminal-button-close svg {
			width: 16px;
			height: 16px;
		}
	}
</style>