<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		canonical?: string;
		ogType?: string;
		ogImage?: string;
		noindex?: boolean;
	}

	const siteUrl = 'https://engabe.com';
	const defaultImage = `${siteUrl}/af-profile-sm.png`;
	const siteName = 'Abe Flansburg | Solutions Architect & Musician';

	let {
		title = siteName,
		description = 'Abe Flansburg — Solutions Architect, AI Architect, Software Developer, and Musician based in Houston, TX.',
		canonical = siteUrl,
		ogType = 'website',
		ogImage = defaultImage,
		noindex = false
	}: Props = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Geo Meta -->
	<meta name="geo.region" content="US-TX" />
	<meta name="geo.placename" content="Houston" />
</svelte:head>
