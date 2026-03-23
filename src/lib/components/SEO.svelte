<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		ogType?: string;
		ogImage?: string;
		noindex?: boolean;
	}

	const siteUrl = 'https://engabe.com';
	const defaultImage = `${siteUrl}/af-profile-sm.png`;
	const siteName = 'Abe Flansburg | AI Solutions Architect Consultant — Houston, TX';

	let {
		title = siteName,
		description = 'Abe Flansburg — AI Solutions Architect Consultant, Software Engineer, Data Scientist & ML Engineer in Houston, TX. Serving healthcare, energy, and oil & gas industries across Texas.',
		keywords = 'AI solutions architect, AI solutions architect consultant, AI consultant Houston, AI consultant Austin, AI consultant San Antonio, AI software engineer Texas, data science consultant, ML engineer Houston, healthcare AI, energy AI, oil and gas AI',
		canonical = siteUrl,
		ogType = 'website',
		ogImage = defaultImage,
		noindex = false
	}: Props = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
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
	<meta name="geo.position" content="29.7604;-95.3698" />
	<meta name="ICBM" content="29.7604, -95.3698" />
</svelte:head>
