<script lang="ts">
	import { PUBLIC_MY_NAME, PUBLIC_AVATAR_IMG_PATH } from '$env/static/public';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { content } = data;

	// Helper function to render markdown-style text (simple implementation)
	function renderMarkdown(text: string): string {
		return text
			.replace(/\*\*(.*?)\*\*/g, '<strong class="text-terminal-green">$1</strong>')
			.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-terminal-green underline hover:text-cyan-400">$1</a>');
	}
</script>

<svelte:head>
	<title>{$weirdWord} - About</title>
	<meta
		name="description"
		content="Learn about Abram Flansburg - a musically inclined technologist, Principal Engineer, and lifelong learner."
	/>
</svelte:head>

<div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
	<!-- ASCII Art Header -->
	<div
		class="mb-8 overflow-x-auto font-mono text-xs text-terminal-green sm:text-sm"
		style="text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);"
	>
		<pre>{`
> ACCESSING PERSONNEL FILE...
> USER: ${PUBLIC_MY_NAME}
> STATUS: [AUTHENTICATED]
> LOADING BIO DATA...
		`}</pre>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
		<!-- Left Column: Profile Image & Quick Info -->
		<div class="flex flex-col items-center lg:items-start">
			<!-- Profile Image -->
			<div
				class="mb-6 overflow-hidden rounded-lg border-2 border-terminal-green/50 shadow-lg shadow-terminal-green/20"
			>
				<img
					src={'/' + PUBLIC_AVATAR_IMG_PATH}
					alt={PUBLIC_MY_NAME}
					class="h-auto w-full max-w-[300px]"
				/>
			</div>

			<!-- Quick Info Card -->
			<div
				class="w-full rounded-md border border-terminal-green/50 bg-gray-900/50 p-4 backdrop-blur-sm"
			>
				<h3 class="mb-3 font-mono text-sm font-bold text-terminal-green">
					&gt; QUICK_ACCESS.exe
				</h3>
				<div class="space-y-2 text-sm">
					{#each content.quick_info as info}
						<div class="flex items-center gap-2">
							<span class="text-terminal-green">→</span>
							<span class="text-gray-300">{info}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right Column: Bio Content -->
		<div class="space-y-6">
			<!-- Introduction -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<h2 class="mb-4 font-mono text-xl font-bold text-terminal-green">
					&gt; INTRODUCTION
				</h2>
				<div class="prose prose-invert max-w-none space-y-4 text-gray-200">
					{#each content.introduction.split('\n\n') as paragraph}
						<p>{@html renderMarkdown(paragraph)}</p>
					{/each}
				</div>
			</section>

			<!-- Academic Background -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<h2 class="mb-4 font-mono text-xl font-bold text-terminal-green">
					&gt; ACADEMIC_BACKGROUND
				</h2>
				<div class="prose prose-invert max-w-none space-y-4 text-gray-200">
					{#each content.academic.split('\n\n') as paragraph}
						<p>{@html renderMarkdown(paragraph)}</p>
					{/each}
				</div>
			</section>

			<!-- Professional Journey -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<h2 class="mb-4 font-mono text-xl font-bold text-terminal-green">
					&gt; PROFESSIONAL_JOURNEY
				</h2>
				<div class="prose prose-invert max-w-none space-y-4 text-gray-200">
					{#each content.professional.split('\n\n') as paragraph}
						<p>{@html renderMarkdown(paragraph)}</p>
					{/each}
				</div>
			</section>

			<!-- Musical Journey -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<h2 class="mb-4 font-mono text-xl font-bold text-terminal-green">
					&gt; MUSICAL_JOURNEY
				</h2>
				<div class="prose prose-invert max-w-none space-y-4 text-gray-200">
					{#each content.musical.split('\n\n') as paragraph}
						<p>{@html renderMarkdown(paragraph)}</p>
					{/each}
				</div>
			</section>

			<!-- Family -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<h2 class="mb-4 font-mono text-xl font-bold text-terminal-green">&gt; FAMILY</h2>
				<div class="prose prose-invert max-w-none space-y-4 text-gray-200">
					{#each content.family.split('\n\n') as paragraph}
						<p>{@html renderMarkdown(paragraph)}</p>
					{/each}
				</div>
			</section>

			<!-- Beliefs & Values -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<h2 class="mb-4 font-mono text-xl font-bold text-terminal-green">
					&gt; BELIEFS_AND_VALUES
				</h2>
				<div class="prose prose-invert max-w-none space-y-4 text-gray-200">
					{#each content.beliefs.intro.split('\n\n') as paragraph}
						<p>{@html renderMarkdown(paragraph)}</p>
					{/each}
					<ul class="list-inside list-disc space-y-2 pl-4">
						{#each content.beliefs.values as value}
							<li>{value}</li>
						{/each}
					</ul>
					<p class="mt-4">In addition:</p>
					<ul class="list-inside list-disc space-y-2 pl-4">
						{#each content.beliefs.additional as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			</section>

			<!-- Closing Note -->
			<section
				class="rounded-md border border-terminal-green/50 bg-gray-900/50 p-6 backdrop-blur-sm"
			>
				<div class="prose prose-invert max-w-none text-gray-200">
					{#each content.closing.split('\n\n') as paragraph}
						<p class="italic">{@html renderMarkdown(paragraph)}</p>
					{/each}
				</div>
			</section>

			<!-- Terminal Footer -->
			<div class="font-mono text-xs text-terminal-green/70 sm:text-sm">
				<pre>{`> END_OF_FILE
> SESSION_COMPLETE`}</pre>
			</div>
		</div>
	</div>
</div>

<style>
	/* Ensure consistent styling */
	:global(.prose a) {
		transition: color 0.2s ease;
	}

	/* Add subtle glow effect to borders on hover */
	section:hover {
		border-color: rgba(34, 197, 94, 0.7);
		transition: border-color 0.3s ease;
	}
</style>
