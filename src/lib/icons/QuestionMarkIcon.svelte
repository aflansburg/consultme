<script>
	export let className = '';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="3"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	<path d="M9.6 9.33a2.4 2.4 0 0 1 4.8 0c0 1.2-.6 1.86-1.8 2.4-1.2.53-1.2 1.47-1.2 1.47" />
	<path d="M11.4 16.8h.2" />
	<filter id="glow">
		<feGaussianBlur stdDeviation="2" result="blur" />
		<feComposite in="SourceGraphic" in2="blur" operator="over" />
	</filter>
</svg>
