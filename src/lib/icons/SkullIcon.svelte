<script lang="ts">
	export let className = '';
</script>

<img
	src="/images/aenima.jpg"
	alt="Aenima album cover"
	class={`h-6 w-6 ${className} transition-all duration-200 rounded-sm object-cover hover:scale-110 brightness-110 contrast-125 saturate-125 hover:brightness-125`}
	style="filter: brightness(1.1) contrast(1.25) saturate(1.25);"
/>