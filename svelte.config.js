import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ path }) => {
				// Intentional 404 easter egg link in the layout
				if (path === '/this-route-def-does-not-exist') return;
				throw new Error(`${path} not found`);
			}
		}
	}
};

export default config;
