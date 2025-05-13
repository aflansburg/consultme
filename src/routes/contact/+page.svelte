<script lang="ts">
	import { PUBLIC_MY_EMAIL, PUBLIC_MY_LINKED_IN_URL } from '$env/static/public';
</script>

<div class="flex flex-col items-center gap-3 py-4">
	<p>Wow this page is really something else.</p>
	<p>Click to copy my email address to your clipboard.</p>
	<button
		class="cursor-pointer rounded-md bg-cyan-700 px-4 py-2 text-white"
		onclick={() => {
			navigator.clipboard.writeText(PUBLIC_MY_EMAIL);
		}}
	>
		{PUBLIC_MY_EMAIL}
	</button>
	<p>Then you can experience the extreme joy of pasting that into your email client manually.</p>
	<br />
	<p>
		My LinkedIn <span class="font-bold text-cyan-600 italic">(Non-Lunatic edition)</span> is also here
		if you want to connect with me:
	</p>
	<button
		onclick={() => {
			window.open(PUBLIC_MY_LINKED_IN_URL, '_blank');
		}}
		class="cursor-pointer rounded-md bg-cyan-700 px-4 py-2 text-white"
	>
		Connect on LinkedIn
	</button>
	<p>
		Oh what did I mean by <span class="font-bold text-cyan-600 italic">Non-Lunatic edition?</span>
	</p>
	<p>
		Well, I'm not a lunatic, but there is this subreddit called <a
			href="https://www.reddit.com/r/LinkedInLunatics/"
			class="font-bold text-cyan-700">r/LinkedInLunatics</a
		>
		that you should check out sometime.
	</p>
</div>

<div class="fixed right-0 bottom-0 left-0">
	<div class="scroll-container py-2">
		<div class="scroll-text">
			<div class="text-wrapper">
				<span class="text-[#00ff00]">Wow, I haven't seen a scrolling marquee since the 90s!</span>
				<span class="cursor"></span>
			</div>
		</div>
	</div>
</div>

<style>
	.scroll-container {
		position: relative;
		width: 100%;
		overflow: hidden;
		background: black;
	}

	.scroll-text {
		display: flex;
		white-space: nowrap;
		font-family: monospace;
	}

	.text-wrapper {
		animation: scroll-left 10s linear infinite;
		padding: 0 50px;
		display: inline-flex;
		align-items: center;
		transform: translateX(100vw);
	}

	@keyframes scroll-left {
		0% {
			transform: translateX(100vw);
		}
		100% {
			transform: translateX(-100%);
		}
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	.cursor {
		display: inline-block;
		width: 2px;
		height: 1em;
		background-color: #00ff00;
		animation: blink 1s step-end infinite;
		margin-left: 2px;
	}
</style>
