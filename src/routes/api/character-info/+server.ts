import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import OpenAI from 'openai';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';

export const POST: RequestHandler = async ({ request }) => {
    try {

        const { characterName } = await request.json();
    
        // Check if we're in development mode
        const isDevelopment = env.DEV;
        
        if (isDevelopment) {
            return json({
                info: `DEV MODE: This is a placeholder response for character "${characterName.replace(' ', '_')}".` + 
                'In production, this would fetch real data from the Rick and Morty Wiki.'
            });
        }
    
        const url = `https://rickandmorty.fandom.com/wiki/${characterName}`;
    
        if (!env.OPENAI_API_KEY) {
            return json({
                error: 'The robot is not properly configured. The API key is missing!'
            }, { status: 500 });
        }
        
        // test to see if the url is valid
        const response = await fetch(url);
        if (!response.ok) {
            return json({
                error: 'Could not find that entity in the Citadel personnel and known entities data stores. :(',
            }, { status: 500 });
        }
        
        console.log(`Launching browser with args: ${chromium.args} and executablePath: ${await chromium.executablePath()}`);
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

        console.log('Browser launched');
    
        const context = await browser.newContext();
        console.log('Context created');
        const page = await context.newPage();
        console.log('Page created');
        await page.goto(url);
        console.log('Page navigated to');

        const relevantContent = await page.evaluate(() => {
            const contentDiv = document.getElementById('mw-content-text');
            if (!contentDiv) return 'Could not find content on the page';
            
            const relevantElements = contentDiv.querySelectorAll('h2, p, ul');

            console.log(`Found ${relevantElements.length} relevant elements:\n ${JSON.stringify(relevantElements, null, 2)}`);
            
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

        // Roughly estimate token count (1 token ≈ 4 chars for English text)
        const estimatedTokens = Math.ceil(relevantContent.length / 4);

        // Truncate if needed to stay under 8192 tokens
        let truncatedContent = relevantContent;
        if (estimatedTokens > 8000) { // Leave some buffer
            // Cut off at roughly 8000 tokens worth of characters
            truncatedContent = relevantContent.substring(0, 32000) + "\n\n[Content truncated to fit token limit]";
        }
    
        await browser.close();
        
        const openai = new OpenAI({
            apiKey: env.OPENAI_API_KEY
        });
    
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: 'system',
                    content: 
                    '*INTERDIMENSIONAL DATA ACCESS PROTOCOL INITIATED* You are a role-playing autonomous system deployed by the Citadel of Ricks that ' + 
                    'can answer questions about a Rick and Morty character using ONLY the information provided in the text content from the Citadel of Ricks.' + 
                    'You should only respond with the information provided in the text content. Do not make up any information.' + 
                    'If you cannot find the information, say so. If the data is labeled truncated at the end, you may note that the balance of the data is not available due to truncation.' +
                    'You should role play a bit as an autonomous system deployed by the Citadel of Ricks to answer questions about the characters. Do not call the characters "characters".'
                },
                {
                    role: 'user',
                    content: `Here is the text content for the character ${characterName}: ${truncatedContent}`
                }
            ]
        });
    
        const info = chatCompletion.choices[0].message.content;
        
    
        return json({
            info
        });
    } catch (error) {
        console.error(error);
        return json({
            info: 'An error occurred while fetching character information.'
        });
    }
}; 