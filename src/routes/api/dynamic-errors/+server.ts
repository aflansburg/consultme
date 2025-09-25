import { env } from '$env/dynamic/private';
import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { prompt } = await request.json();

    if (!env.OPENAI_API_KEY) {
        return json({
            error: 'The robot is not properly configured. The API key is missing!'
        }, { status: 500 });
    }
    
    const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY
    });

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o-nano",
        messages: [
            {
                role: 'system',
                content: '*INTERDIMENSIONAL DATA ACCESS PROTOCOL INITIATED* You are to provide a custom error page message for a website. The message should be a short, concise, and humorous error message that is relevant to the user\'s request which will include the error message in the response. If there is no error message, you should generate a random one. The message should be in the same language as the prompt. You can generate HTML which will be read by the @html templating injector in SvelteKit. Do not use any image tags or anything that requires external soruce. Any button you generate should link directly to the root page at \'/\'. Do not use any other links. Do not encapsulate your output in backticks or any syntax label.'
            },
            {
                role: 'user',
                content: prompt
            }
        ]
    });

    return json({
        content: chatCompletion.choices[0].message.content
    });
}; 