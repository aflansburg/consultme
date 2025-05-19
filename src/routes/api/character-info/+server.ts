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
                error: 'Could not find that character on the Rick and Morty Wiki :(',
            }, { status: 500 });
        }
    
        const browser = await playwright.chromium.launch({
            executablePath: await chromium.executablePath(),
            args: chromium.args,
            headless: true,
        });
    
        const context = await browser.newContext();
        const page = await context.newPage();
    
        await page.goto(url);
    
        const relevantContent = await page.evaluate(() => {
            const contentDiv = document.getElementById('mw-content-text');
            if (!contentDiv) return 'Could not find content on the page';
            
            const relevantElements = contentDiv.querySelectorAll('h2, p, ul, aside, a');
            
            const container = document.createElement('div');
            
            relevantElements.forEach(el => {
                container.appendChild(el.cloneNode(true));
            });
            
            return container.innerHTML;
        });
    
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
                    '*INTERDIMENSIONAL DATA ACCESS PROTOCOL INITIATED* You are a helpful assistant that ' + 
                    'can answer questions about a Rick and Morty character using ONLY the information provided in the HTML content from the Citadel of Ricks.' + 
                    'You should only respond with the information provided in the HTML content. Do not make up any information.' + 
                    'If you cannot find the information, say so.' + 
                    'Do not use any image tags or anything that requires external source.' + 
                    'Do not use any other links.' + 
                    'Do not encapsulate your output in backticks or any syntax label.' + 
                    'Do not use any other formatting. Just the facts.'
                },
                {
                    role: 'user',
                    content: `Here is the HTML content for the character ${characterName}: ${relevantContent}`
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