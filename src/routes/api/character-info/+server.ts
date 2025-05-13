import { env } from '$env/dynamic/private';
import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { characterName } = await request.json();

    if (!env.OPENAI_API_KEY) {
        return json({
            error: 'The robot is not properly configured. The API key is missing!'
        }, { status: 500 });
    }
    
    const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY
    });

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: 'system',
                content: '*INTERDIMENSIONAL DATA ACCESS PROTOCOL INITIATED* You are to provide classified intelligence on subjects from across infinite realities. Maintain detached, matter-of-fact tone. Clearance level: Infinity. Provide intel in short, declarative statements. Include both observable facts and restricted knowledge that only an entity with pan-dimensional oversight would know. Do not identify yourself or your agency. Do not use formatting or labels. Speak as if these are entries from a classified database. CONTENT PROTOCOL: All information must adhere to PG-13 standards. Avoid graphic violence, explicit content, substance abuse, and inappropriate themes. Maintain family-friendly intelligence reporting.'
            },
            {
                role: 'user',
                content: `Tell me about ${characterName}`
            }
        ]
    });

    return json({
        info: chatCompletion.choices[0].message.content
    });
}; 