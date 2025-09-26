<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	interface GitHubCommit {
		sha: string;
		commit: {
			message: string;
			author: {
				name: string;
				date: string;
			};
		};
		html_url: string;
	}

	let commits = $state<GitHubCommit[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function fetchCommits() {
		if (commits.length > 0) return; // Don't fetch if already loaded

		loading = true;
		error = null;

		try {
			const response = await fetch('https://api.github.com/repos/aflansburg/consultme/commits?per_page=20');

			if (!response.ok) {
				throw new Error(`GitHub API error: ${response.status}`);
			}

			const data = await response.json();
			commits = data;
		} catch (err) {
			console.error('Failed to fetch commits:', err);
			error = err instanceof Error ? err.message : 'Failed to fetch changelog';
		} finally {
			loading = false;
		}
	}

	// Fetch commits when modal opens
	$effect(() => {
		if (isOpen) {
			fetchCommits();
		}
	});

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

	// Format date for display
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	// Truncate long commit messages
	function truncateMessage(message: string): string {
		const lines = message.split('\n');
		const firstLine = lines[0];
		return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="changelog-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="changelog-modal-title"
		tabindex="-1"
	>
		<!-- Terminal-style data streams for ambiance -->
		<div class="data-stream" style="left: 2%; animation-delay: 0s;">LOADING_CHANGELOG...</div>
		<div class="data-stream" style="left: 8%; animation-delay: 0.5s;">GIT_HISTORY_SCAN</div>
		<div class="data-stream" style="left: 15%; animation-delay: 1s;">COMMIT_DATA_SYNC</div>
		<div class="data-stream" style="left: 25%; animation-delay: 1.5s;">GITHUB_API_ACTIVE</div>
		<div class="data-stream" style="left: 35%; animation-delay: 2s;">VERSION_CONTROL</div>
		<div class="data-stream" style="left: 45%; animation-delay: 2.5s;">BRANCH_ANALYSIS</div>
		<div class="data-stream" style="left: 55%; animation-delay: 3s;">REPO_METADATA</div>
		<div class="data-stream" style="left: 65%; animation-delay: 0.8s;">CHANGELOG_READY</div>
		<div class="data-stream" style="left: 75%; animation-delay: 1.3s;">COMMIT_VERIFIED</div>
		<div class="data-stream" style="left: 85%; animation-delay: 1.8s;">DATA_RETRIEVED</div>
		<div class="data-stream" style="left: 92%; animation-delay: 2.3s;">SYSTEM_READY</div>

		<!-- Modal Container -->
		<div
			class="changelog-modal-container relative w-full max-w-4xl mx-auto animate-slide-up"
			role="document"
		>
			<!-- Terminal-style header -->
			<div class="changelog-header mb-4 text-center">
				<div class="rounded-md border border-terminal-green/50 bg-black/20 px-4 py-3 mb-2 terminal-font text-xs sm:text-sm">
					<div class="text-terminal-green font-bold text-center mb-1">C-137-INFO CHANGELOG TERMINAL</div>
					<div class="text-terminal-green font-bold text-center">VERSION HISTORY DATABASE</div>
				</div>
				<h2 id="changelog-modal-title" class="text-terminal-green font-bold text-lg sm:text-xl terminal-font">
					> ACCESSING_COMMIT_HISTORY...
				</h2>
			</div>

			<!-- Close button -->
			<button
				onclick={onClose}
				class="absolute -top-6 right-0 z-10 terminal-button-close w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
				aria-label="Close changelog"
				title="Close changelog (ESC)"
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

			<!-- Content Container -->
			<div class="changelog-content-container relative w-full terminal-border bg-black/95 rounded-lg overflow-hidden max-h-[70vh]">
				<div class="p-4 sm:p-6">
					{#if loading}
						<div class="text-center py-8">
							<div class="text-terminal-green terminal-font">
								<div class="animate-pulse mb-2">> SCANNING REPOSITORY...</div>
								<div class="animate-pulse mb-2">> FETCHING COMMIT HISTORY...</div>
								<div class="animate-pulse">> PROCESSING DATA...</div>
							</div>
						</div>
					{:else if error}
						<div class="text-center py-8">
							<div class="text-red-400 terminal-font mb-4">
								<div class="text-lg font-bold mb-2">ERROR: CHANGELOG ACCESS FAILED</div>
								<div class="text-sm opacity-80">{error}</div>
							</div>
							<button
								onclick={fetchCommits}
								class="terminal-button px-4 py-2 rounded-md terminal-font text-sm"
							>
								> RETRY
							</button>
						</div>
					{:else if commits.length > 0}
						<div class="space-y-3 max-h-[60vh] overflow-y-auto">
							<div class="rounded-md border border-terminal-green/50 bg-black/20 px-3 py-2 mb-4 terminal-font text-xs">
								<div class="text-terminal-green font-bold text-center">RECENT COMMITS</div>
							</div>

							{#each commits as commit, index}
								<div class="border border-terminal-green/30 bg-black/40 rounded-md p-3 hover:bg-black/60 transition-colors">
									<div class="flex flex-col sm:flex-row sm:items-start gap-2">
										<div class="flex-1">
											<div class="text-terminal-green font-bold text-sm mb-1 terminal-font">
												{truncateMessage(commit.commit.message)}
											</div>
											<div class="text-terminal-green/70 text-xs terminal-font">
												<span class="text-rick-cyan">{commit.commit.author.name}</span>
												<span class="mx-2">•</span>
												<span>{formatDate(commit.commit.author.date)}</span>
											</div>
										</div>
										<div class="flex items-center gap-2 text-xs">
											<code class="text-terminal-blue bg-black/50 px-2 py-1 rounded terminal-font">
												{commit.sha.substring(0, 8)}
											</code>
											<a
												href={commit.html_url}
												target="_blank"
												rel="noopener noreferrer"
												class="text-portal-orange hover:text-terminal-green transition-colors terminal-font"
												title="View on GitHub"
											>
												→
											</a>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Terminal-style footer info -->
			<div class="changelog-footer mt-4 text-center">
				<div class="rounded-md border border-terminal-green/30 bg-black/10 px-3 py-2 terminal-font text-xs">
					<div class="text-terminal-green/60">
						REPO: aflansburg/consultme | COMMITS: {commits.length} | ESC_TO_CLOSE
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.changelog-modal-overlay {
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

	/* Changelog content container styling */
	.changelog-content-container {
		box-shadow:
			0 0 20px rgba(34, 197, 94, 0.2),
			inset 0 0 20px rgba(0, 0, 0, 0.5);
	}

	/* Custom scrollbar for commit list */
	.changelog-content-container ::-webkit-scrollbar {
		width: 8px;
	}

	.changelog-content-container ::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
	}

	.changelog-content-container ::-webkit-scrollbar-thumb {
		background: rgba(34, 197, 94, 0.3);
		border-radius: 4px;
	}

	.changelog-content-container ::-webkit-scrollbar-thumb:hover {
		background: rgba(34, 197, 94, 0.5);
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.changelog-header h2 {
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

		.changelog-content-container {
			max-height: 60vh;
		}
	}
</style>