export async function generateErrorMessage(): Promise<string> {
    try {
        const response = await fetch('/api/dynamic-errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: 'Generate a random funny error message'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch error message');
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('Error generating error message:', error);
        return 'Error generating error message. The universe is experiencing technical difficulties.';
    }
} 