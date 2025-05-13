# ConsultMe

An AI-powered consultation assistant.

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
