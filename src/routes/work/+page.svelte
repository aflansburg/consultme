<script lang="ts">
	import { onMount } from 'svelte';
	import { weirdWord } from '$lib/stores/weirdWord.svelte';
	import { colorMode } from '$lib/stores/sitePreferences.svelte';

	import {
		generateRandomCombination,
		type AdjectiveType,
		type NounType
	} from '$lib/utils/nameGenerator';
	import ClickMeIcon from '$lib/icons/ClickMeIcon.svelte';

	let randomCombination = $state('');
	let loading = $state(false);
	let spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let currentSpinnerFrame = $state(0);
	let spinnerInterval: ReturnType<typeof setInterval>;

	const handleGenerateRandomCombination = () => {
		loading = true;
		const adjectives = ['celestial', 'serious', 'humorous'];
		const nouns = ['cat', 'animal', 'star'];

		const selectedAdjective = adjectives[
			Math.floor(Math.random() * adjectives.length)
		] as AdjectiveType;
		const selectedNoun = nouns[Math.floor(Math.random() * nouns.length)] as NounType;

		try {
			randomCombination = generateRandomCombination(selectedAdjective, selectedNoun);
		} catch (error) {
			console.error('Error generating random combination:', error);
			randomCombination = 'Error generating combination';
		} finally {
			loading = false;
		}
	};

	const projects = [
		{
			name: 'Spicy Donkey',
			link: 'https://www.npmjs.com/package/spicy-donkey',
			additionalHtmlContent: [
				`
                <p class="text-md text-gray-200 py-2">
                    Spicy Donkey is a random name generating project nobody asked for with support for CommonJS, ES6 Module, and browser script
                </p>
            `
			]
		},
		{
			name: 'This website',
			link: '/',
			additionalHtmlContent: [
				`
                <p class="text-md text-gray-200 py-2">
                    This website is a SvelteKit web application that I use to publish projects, thoughts, contact info, etc.
					<br>
					You can find the source code for this website <a href="https://github.com/aflansburg/consultme" target="_blank">here</a>.
                </p>
				<p class="text-md text-gray-200 py-2 font-bold">
					About this project
				</p>
				<ul class="list-disc list-inside text-md">
					<li>
						Deployed to Google Cloud Run
					</li>
					<li>
						Uses Playwright & a minimal Chromium lib to scrape data from the Rick & Morty Fandom Wiki which is then provided to an LLM (see below)
					</li>
					<li>
						Uses OpenAI's GPT-4 to generate additional information about R&M characters
					</li>
            `
			]
		},
		{
			name: 'Contributor: ScrapeGraphAI',
			link: 'https://github.com/ScrapeGraphAI/Scrapegraph-ai',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					ScrapeGraphAI offers seamless integration with popular frameworks and tools to enhance your scraping capabilities. Whether you're building with Python or Node.js, using LLM frameworks, or working with no-code platforms, we've got you covered with our comprehensive integration options.
				</p>
			`
			]
		}
	];

	const companies = [
		{
			name: 'Remo Health',
			link: 'https://remo.health',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I work at Remo Health as a Senior Platform Engineer II.
					I'm not sure what the II means, but I'm sure it's important.
				</p>
				`
			]
		},
		{
			name: 'Tribunus Health',
			link: 'https://www.tribunushealth.com/',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I consulted with Tribunus Health as a Solutions Engineer and helped augment their data platform.
				</p>
				`
			]
		},
		{
			name: 'Brightside Health',
			link: 'https://www.brightside.com',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Brightside Health as both a Staff Platform Engineer and a Staff DevOps Engineer.
				</p>
				`
			]
		},
		{
			name: 'Requis',
			link: 'https://requis.com',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Requis as a Sr. Platform Engineer / Sr. Software Engineer / Data Engineering from Dec 2018 to Apr 2022.
					Worked on fullstack development using Ruby, Rails, Python, JavaScript, React, and Node. Leveraged data science 
					techniques to extract patterns from data and built data engineering solutions for data acquisition, warehousing, 
					and analysis.
				</p>
				`
			]
		},
		{
			name: 'Rough Country',
			link: 'https://roughcountry.com',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Rough Country as an eCommerce Software Engineer from Oct 2017 to Dec 2018.
					Augmented eCommerce framework using Amazon, eBay, Magento, & ChannelAdvisor APIs and developed analytical 
					web applications using the MERN stack (Node.js, React.js, MongoDB).
				</p>
				`
			]
		},
		{
			name: 'Local Government Corporation',
			link: '#',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Local Government Corporation as a Solutions Engineer from Jul 2016 to Oct 2017.
					Provided technology consulting for government entities and developed backup solutions using .NET and C#.
				</p>
				`
			]
		},
		{
			name: 'ERMCO Inc.',
			link: 'https://ermco-eci.com',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at ERMCO Inc. as a Senior Network Engineer from Aug 2015 to Aug 2016.
					Supported network infrastructure, developed automation tools using Python and PHP, and managed 
					Windows and Linux servers in VMware environments.
				</p>
				`
			]
		},
		{
			name: 'MarkITx',
			link: 'https://www.crunchbase.com/organization/markitx',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at MarkITx (acquired by 6Fusion and later Requis - see role above) as a Data Engineer from Mar 2014 to Mar 2016.
					Developed Python-based analytical tools and data pipelines for ingesting transactional data 
					to develop price prediction models.
				</p>
				`
			]
		},
		{
			name: 'Hilton',
			link: 'https://www.hilton.com/en/corporate/',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Hilton as a Strategic Sourcing Analytics Engineer from Aug 2014 to Dec 2014.
					Acted as liaison between Strategic Service Management and various IT departments, analyzed cloud spend,
					and contributed to sourcing governance in Salesforce.
				</p>
				`
			]
		},
		{
			name: 'ServerMonkey.com',
			link: 'https://servermonkey.com',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at ServerMonkey.com as a Procurement Engineering Manager from Apr 2011 to Mar 2014.
					Managed supply chain and eCommerce operations, contributed to eCommerce platform development,
					and managed SAP ERP implementation.
				</p>
				`
			]
		},
		{
			name: 'BerryThemes',
			link: '#',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I founded BerryThemes, LLC and worked as a Mobile Application Developer from Jan 2007 to Aug 2012.
					Created software and themes for Blackberry devices, successfully released 20 different enhancements,
					and developed one of the first iPhone emulation themes for Blackberry devices.
				</p>
				`
			]
		},
		{
			name: 'Smith & Associates',
			link: 'https://smithweb.com/',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Smith & Associates as a Procurement Engineer for Integrated Circuits from Apr 2010 to Apr 2011.
					Served as a technical buyer for the Integrated Circuit Product Group and supported electronics and 
					computer hardware manufacturing.
				</p>
				`
			]
		},
		{
			name: 'CGG',
			link: 'https://www.viridiengroup.com/',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at Veritas DGC, acquired by CGG (now Viridien Group) in 2010as a Technology Procurement Engineer from Nov 2006 to Jan 2010.
					Managed technology procurement projects, developed relationships with key vendors, and 
					analyzed quarterly IT spend data while supporting on premise data center & cloud operations.
				</p>
				`
			]
		},
		{
			name: 'DXP Enterprises',
			link: 'https://dxpe.com',
			additionalHtmlContent: [
				`
				<p class="text-md text-gray-200 py-2">
					I worked at DXP Enterprises as a Procurement Data Analyst from Dec 2005 to Dec 2006.
					Analyzed procurement and inventory data and designed SQL queries to retrieve relevant data.
				</p>
				`
			]
		}
	];

	onMount(() => {
		console.log('Work page mounted');
		spinnerInterval = setInterval(() => {
			currentSpinnerFrame = (currentSpinnerFrame + 1) % spinnerFrames.length;
		}, 80);

		return () => {
			clearInterval(spinnerInterval);
		};
	});
</script>

<svelte:head>
	<title>{$weirdWord} Projects</title>
</svelte:head>

<div class="projects-container" class:dark={$colorMode === 'dark'}>
	<h1 class="mb-4 text-2xl font-bold">Projects</h1>
	<p class="mb-4">
		Some of the projects are pretty useless, but they were fun to make. I've spent far too much time
		building things for companies and not enough time contributing to open source, but this year
		I've really started to change that.
	</p>
	<ul role="list" class="divide-y divide-gray-600">
		{#each projects as project}
			<li class="py-4">
				<a href={project.link} class="font-medium text-cyan-400/90 transition-all" target="_blank"
					>> {project.name}</a
				>
				{#each project.additionalHtmlContent as content}
					{@html content}
				{/each}
				{#if project.name === 'Spicy Donkey'}
					<div class="flex items-center gap-4">
						<button
							type="button"
							class="inline-flex cursor-pointer items-center gap-2 rounded border border-green-500/30 {$colorMode ===
							'dark'
								? 'bg-zinc-800'
								: 'bg-zinc-200'} px-3 py-1.5 text-green-400 transition-all hover:border-green-500/50 hover:{$colorMode ===
							'dark'
								? 'bg-zinc-700'
								: 'bg-zinc-300'}"
							onclick={handleGenerateRandomCombination}
							aria-label="Generate Random Combination"
						>
							<ClickMeIcon
								className={$colorMode === 'dark' ? 'text-green-300' : 'text-green-600'}
							/>
							{loading ? 'Loading...' : ''}
						</button>
						<p
							class="pulse-animation text-sm text-green-400 {randomCombination
								? 'glow-border'
								: ''}"
						>
							{#if !randomCombination}
								<span class="spinner inline-block">{spinnerFrames[currentSpinnerFrame]}</span>
							{:else}
								{randomCombination}
							{/if}
						</p>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</div>

<hr class="my-8 h-px border-0 bg-gray-600" />

<div class="companies-container" class:dark={$colorMode === 'dark'}>
	<h1 class="mt-4 mb-2 text-2xl font-bold antialiased">Companies</h1>
	<ul role="list" class="divide-y divide-gray-600">
		{#each companies as company}
			<li class="py-4">
				<a href={company.link} class="font-medium text-cyan-400/90 transition-all" target="_blank"
					>> {company.name}</a
				>
				{#each company.additionalHtmlContent as content}
					{@html content}
				{/each}
			</li>
		{/each}
	</ul>
</div>

<style>
	.pulse-animation {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.glow-border {
		border: 2px solid rgba(34, 197, 94, 0.5);
		box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
	}

	.spinner {
		width: 1em;
		margin-right: 0.5em;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			text-shadow: 0 0 15px rgba(34, 197, 94, 0.8);
		}
		50% {
			opacity: 0.7;
			text-shadow: 0 0 5px rgba(34, 197, 94, 0.4);
		}
	}

	@keyframes glow {
		0%,
		100% {
			text-shadow: 0 0 0px var(--glow-color, #67e8f9);
		}
		50% {
			text-shadow: 0 0 15px var(--glow-color, #67e8f9);
		}
	}

	/* Color mode styles */
	.projects-container {
		color: var(--text-color, #1e293b); /* Default to a dark slate color */
	}

	.projects-container.dark {
		--text-color: #f8fafc; /* Light text for dark mode */
	}

	:global(.dark) .glow-border {
		--glow-color: #22c55e;
	}

	/* Force text color based on color mode */
	:global(.projects-container *) {
		color: #1e293b !important; /* Default text color for light mode */
	}

	:global(.dark .projects-container *) {
		color: #f8fafc !important; /* Light text for dark mode */
	}

	/* Exceptions for links and special elements */
	:global(.projects-container a),
	:global(.projects-container button),
	:global(.projects-container .text-green-400),
	:global(.projects-container .text-cyan-400) {
		color: inherit !important; /* Allow these elements to keep their specific colors */
	}
</style>
