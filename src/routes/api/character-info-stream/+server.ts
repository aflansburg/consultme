import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';

export const POST: RequestHandler = async ({ request }) => {
    const { characterName } = await request.json();

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (data: any) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            const addLog = (message: string) => {
                const timestamp = new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'America/Chicago',
                    timeZoneName: 'short'
                });

                sendEvent({
                    type: 'log',
                    message,
                    timestamp
                });
                console.log(message);
            };

            // Start the async processing
            processCharacterInfo(characterName, addLog, sendEvent)
                .then((result) => {
                    sendEvent({
                        type: 'complete',
                        data: result
                    });
                    controller.close();
                })
                .catch((error) => {
                    sendEvent({
                        type: 'error',
                        message: error.message || 'An error occurred'
                    });
                    controller.close();
                });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
};

async function processCharacterInfo(
    characterName: string,
    addLog: (message: string) => void,
    sendEvent: (data: any) => void
) {
    const isDevelopment = env.DEV;

    if (isDevelopment) {
        addLog('> DEV_MODE: Bypassing web scraper');
        addLog('> MOCK_DATA: Generating placeholder response');
        addLog('> STATUS: Development environment detected');

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            info: `DEV MODE: This is a placeholder response for character "${characterName.replace(' ', '_')}". In production, this would fetch real data from the Rick and Morty Wiki.`
        };
    }

    const url = `https://rickandmorty.fandom.com/wiki/${characterName}`;
    addLog(`> TARGET_URL: ${url}`);

    if (!env.OPENAI_API_KEY) {
        throw new Error('The robot is not properly configured. The API key is missing!');
    }

    addLog('> VALIDATING_TARGET_ENTITY...');
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Could not find that entity in the Citadel personnel and known entities data stores. :(');
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

    try {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 45000 // 45 second timeout
        });
        addLog('> NAVIGATION_COMPLETE: Extracting data');
    } catch (error: any) {
        if (error.message.includes('Timeout')) {
            addLog('> NAVIGATION_TIMEOUT: Retrying with reduced timeout...');
            try {
                await page.goto(url, {
                    waitUntil: 'load',
                    timeout: 20000 // 20 second timeout for retry
                });
                addLog('> NAVIGATION_RETRY_SUCCESS: Extracting data');
            } catch (retryError: any) {
                addLog('> NAVIGATION_FAILED: Attempting data extraction anyway...');
                // Continue anyway - sometimes we can still extract data
            }
        } else {
            throw error;
        }
    }

    let relevantContent = '';

    try {
        relevantContent = await page.evaluate(() => {
            const contentDiv = document.getElementById('mw-content-text');
            if (!contentDiv) return 'Could not find content on the page';

            const relevantElements = contentDiv.querySelectorAll('h2, p, ul');

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
    } catch (extractError) {
        addLog('> DATA_EXTRACTION_ERROR: Using fallback method...');
        relevantContent = `Character name: ${characterName}\nData extraction failed due to page loading issues.`;
    }

    addLog(`> DATA_EXTRACTED: ${relevantContent.length} characters retrieved`);

    const estimatedTokens = Math.ceil(relevantContent.length / 4);
    addLog(`> TOKEN_ESTIMATION: ~${estimatedTokens} tokens`);

    let truncatedContent = relevantContent;
    if (estimatedTokens > 8000) {
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
                '╔═════════════════════════════════════╗\n' +
                '║       CLASSIFICATION: [TYPE]        ║\n' +
                '║       C-137-INFO ENTITY REPORT      ║\n' +
                '╚═════════════════════════════════════╝\n' +
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
                '══════════════════════════════════════════════════════\n' +
                'STATUS: ANALYSIS_COMPLETE\n' +
                'CONFIDENCE: ##.#%\n' +
                'NEXT_UPDATE: [Status]\n' +
                '══════════════════════════════════════════════════════\n' +
                '\n' +
                'IMPORTANT: Each section MUST be separated by blank lines. Use \\n\\n between sections.'
            },
            {
                role: 'user',
                content: `╔═══════════════════════════════════════════════╗
║        ENTITY ANALYSIS REQUEST                ║
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

    return { info };
}