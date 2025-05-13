# ConsultMe

A simple SvelteKit application for portfolio, consulting site, etc.
Has a weird obsession with Rick & Morty lore. ¯\_(ツ)_/¯

You can check out my deployed version on Google Cloud run at:
https://engabe.com

## Prerequisites

This project uses Node.js v22.15.0. We recommend using NVM (Node Version Manager) to manage your Node.js versions.

1. First, install NVM if you haven't already:
   - [NVM Installation Guide](https://github.com/nvm-sh/nvm#installing-and-updating)

2. Then use NVM to install and use the correct Node version:
   ```bash
   # Install the required Node version
   nvm install

   # Use the required Node version
   nvm use
   ```

## Environment Variables

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env  # If .env.example exists
   # or create .env manually
   ```

2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

   > ⚠️ Never commit your `.env` file or share your API key publicly

Note: In production, you will ned to set the env var.

## Setting Up the Project

1. Clone the repository
2. Switch to the correct Node version:
   ```bash
   nvm use
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deploying to production

### Google Cloud Run: Using the `deploy.sh` helper script

First ensure you have the right adapter setup in `svelte.config.js`.
e.g. for Cloud Run:
```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter()
	}
};

export default config;
```

Then you can run:
```bash
./scripts/deploy.sh your-cloudrun-service-name your-gcp-project-id
```

### Manually
I deploy to Cloud Run, so I do:

```bash
# auth with gcloud
gcloud auth login

# make sure it builds
npm run build

# submit build
gcloud builds submit --config=cloudbuild.yaml --substitutions=_SERVICE_NAME=your-service-name

# set your PROJECT_ID
PROJECT_ID=your-project-id

# deploy build
gcloud run deploy consultme --image gcr.io/$PROJECT_ID/your-cloudrun-service-name --platform managed --allow-unauthenticated --region us-central1 # or whatever region you prefer
```

Populate the `cloudbuild.yaml` file with the appropriate PUBLIC env var, and you can set your `OPENAI_API_KEY` directly in your Cloud Run service. Or clobber my deployment setup and deploy however you want. Vercel is pretty easy....
