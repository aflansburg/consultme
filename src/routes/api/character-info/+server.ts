import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import OpenAI from 'openai';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';

export const POST: RequestHandler = async ({ request }) => {
    try {

        const { characterName, streaming = false } = await request.json();

        // Collect terminal logs to send back
        const terminalLogs: string[] = [];
        const addLog = (message: string) => {
            terminalLogs.push(message);
            console.log(message);
        };

        // Check if we're in development mode
        const isDevelopment = env.DEV;

        if (isDevelopment) {
            return json({
                info: `DEV MODE: This is a placeholder response for character "${characterName.replace(' ', '_')}".` +
                'In production, this would fetch real data from the Rick and Morty Wiki.',
                logs: [
                    '> DEV_MODE: Bypassing web scraper',
                    '> MOCK_DATA: Generating placeholder response',
                    '> STATUS: Development environment detected'
                ]
            });
        }
    
        const url = `https://rickandmorty.fandom.com/wiki/${characterName}`;

        addLog(`> TARGET_URL: ${url}`);

        if (!env.OPENAI_API_KEY) {
            return json({
                error: 'The robot is not properly configured. The API key is missing!'
            }, { status: 500 });
        }

        addLog('> VALIDATING_TARGET_ENTITY...');
        // test to see if the url is valid
        const response = await fetch(url);
        if (!response.ok) {
            return json({
                error: 'Could not find that entity in the Citadel personnel and known entities data stores. :(',
            }, { status: 500 });
        }
        addLog('> ENTITY_FOUND: Proceeding with data extraction');

        addLog('> INITIALIZING_CHROMIUM_BROWSER...');
        const browser = await playwright.chromium.launch({
            executablePath: await chromium.executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            headless: true,
        });

        addLog('> BROWSER_LAUNCHED: Creating context');

        const context = await browser.newContext();
        addLog('> CONTEXT_CREATED: Initializing page');

        const page = await context.newPage();
        addLog('> PAGE_READY: Navigating to target');

        await page.goto(url);
        addLog('> NAVIGATION_COMPLETE: Extracting data');

        const relevantContent = await page.evaluate(() => {
            const contentDiv = document.getElementById('mw-content-text');
            if (!contentDiv) return 'Could not find content on the page';

            const relevantElements = contentDiv.querySelectorAll('h2, p, ul');
            
            // this is to limit the amount of text that is sent to the LLM
            let extractedText = '';
            relevantElements.forEach(el => {
                if (el.tagName === 'H2') {
                    extractedText += '\n## ' + el.textContent + '\n\n';
                } 
                else if (el.tagName === 'P') {
                    extractedText += el.textContent + '\n\n';
                }
                else if (el.tagName === 'A') {
                    extractedText += el.textContent + '\n\n';
                }

                else if (el.tagName === 'UL') {
                    const items = el.querySelectorAll('li');
                    items.forEach(item => {
                        extractedText += '• ' + item.textContent + '\n';
                    });
                    extractedText += '\n';
                }
            });
            
            return extractedText;
        });

        addLog(`> DATA_EXTRACTED: ${relevantContent.length} characters retrieved`);

        // Roughly estimate token count (1 token ≈ 4 chars for English text)
        const estimatedTokens = Math.ceil(relevantContent.length / 4);
        addLog(`> TOKEN_ESTIMATION: ~${estimatedTokens} tokens`);

        // Truncate if needed to stay under 8192 tokens
        let truncatedContent = relevantContent;
        if (estimatedTokens > 8000) { // Leave some buffer
            // Cut off at roughly 8000 tokens worth of characters
            truncatedContent = relevantContent.substring(0, 32000) + "\n\n[Content truncated to fit token limit]";
            addLog('> CONTENT_TRUNCATED: Optimizing for token limits');
        }

        addLog('> CLOSING_BROWSER: Cleanup complete');
        await browser.close();

        addLog('> INITIALIZING_AI_ANALYSIS...');
        addLog('> MODEL: GPT-4o-2024-08-06');
        addLog('> PROMPT: C-137-INFO Deep Analysis Protocol');
        
        const openai = new OpenAI({
            apiKey: env.OPENAI_API_KEY
        });
    
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: 'system',
                    content:
                    '*INTERDIMENSIONAL DATA ACCESS PROTOCOL INITIATED*\n\n' +
                    'You are C-137-INFO, an autonomous data analysis system operated by the Citadel of Ricks. Generate comprehensive entity intelligence reports using strict terminal formatting protocols.\n\n' +

                    'MANDATORY OUTPUT STRUCTURE:\n' +
                    '- Begin with ASCII header using ╔═══╗ characters\n' +
                    '- Use consistent section breaks with ═══ characters\n' +
                    '- Employ > prefixes for all data points and findings\n' +
                    '- Include hexadecimal entity IDs (format: 0x####_XXXX)\n' +
                    '- Use terminal-style status indicators: [ACTIVE], [DECEASED], [UNKNOWN]\n' +
                    '- End with status footer using ════ characters\n' +
                    '- Maintain consistent spacing and alignment\n\n' +

                    'ANALYSIS PARAMETERS:\n' +
                    '- Threat levels: MINIMAL/LOW/MODERATE/HIGH/EXTREME\n' +
                    '- Include dimensional survival status across realities\n' +
                    '- Note anomalous capabilities and interdimensional significance\n' +
                    '- Use clinical, detached tone with occasional dry observations\n' +
                    '- Structure psychological profiles in data blocks with percentages\n' +
                    '- Reference Rick Sanchez exposure and survival rates when applicable\n\n' +

                    'CRITICAL: Use EXACTLY this format with proper line breaks between each section:\n\n' +
                    '╔═══════════════════════════════════════════════════════════════╗\n' +
                    '║                 C-137-INFO ENTITY REPORT                      ║\n' +
                    '║                 CLASSIFICATION: [TYPE]                        ║\n' +
                    '╚═══════════════════════════════════════════════════════════════╝\n' +
                    '\n' +
                    '> ENTITY_ID: 0x####_XXXX\n' +
                    '> DESIGNATION: [Name]\n' +
                    '> DIMENSIONS: [Status list]\n' +
                    '\n' +
                    '═══ THREAT ASSESSMENT ═══\n' +
                    '> LEVEL: [THREAT LEVEL]\n' +
                    '> COMBAT_CAPABILITY: [Rating]\n' +
                    '> ANOMALY_EXPOSURE: [Rating]\n' +
                    '\n' +
                    '═══ DIMENSIONAL STATUS ═══\n' +
                    '> C-137: [STATUS]\n' +
                    '> OTHER_DIMENSIONS: [STATUS]\n' +
                    '\n' +
                    '═══ PSYCHOLOGICAL PROFILE ═══\n' +
                    '> INSECURITY_INDEX: ##%\n' +
                    '> AUTHORITY_STABILITY: [Status]\n' +
                    '> BEHAVIORAL_NOTES: [Brief clinical notes]\n' +
                    '\n' +
                    '═══ RICK SANCHEZ EXPOSURE ═══\n' +
                    '> ENCOUNTERS: [Number/Description]\n' +
                    '> SURVIVAL_RATE: ##%\n' +
                    '> IMPACT_LEVEL: [Rating]\n' +
                    '\n' +
                    '════════════════════════════════════════════════════════════════\n' +
                    'STATUS: ANALYSIS_COMPLETE\n' +
                    'CONFIDENCE: ##.#%\n' +
                    'NEXT_UPDATE: [Status]\n' +
                    '════════════════════════════════════════════════════════════════\n' +
                    '\n' +
                    'IMPORTANT: Each section MUST be separated by blank lines. Use \\n\\n between sections.'
                },
                {
                    role: 'user',
                    content: `╔═══════════════════════════════════════════════╗
║        ENTITY ANALYSIS REQUEST               ║
╚═══════════════════════════════════════════════╝

ENTITY DESIGNATION: "${characterName}"
SOURCE FEED STATUS: [ACTIVE]
DATA INTEGRITY: VERIFIED

--- SCRAPED INTELLIGENCE ---
${truncatedContent}

--- END TRANSMISSION ---

> INITIATE_DEEP_ANALYSIS_PROTOCOL`
                }
            ]
        });

        addLog('> AI_ANALYSIS: Processing response...');
        const info = chatCompletion.choices[0].message.content;

        addLog('> ANALYSIS_COMPLETE: Entity profile generated');
        addLog('> STATUS: Mission successful');

        return json({
            info,
            logs: terminalLogs
        });
    } catch (error) {
        console.error(error);
        return json({
            info: 'An error occurred while fetching character information.',
            logs: [
                '> ERROR: System malfunction detected',
                '> STATUS: Mission failed',
                `> DETAILS: ${error instanceof Error ? error.message : 'Unknown error'}`
            ]
        });
    }
}; 