interface Character {
    id: number;
    name: string;
    status: string;
    species: string;
    type: string;
    gender: string;
    origin: {
        name: string;
        url: string;
    };
    location: {
        name: string;
        url: string;
    };
    image: string;
    episode: string[];
    url: string;
    created: string;
}

interface CharacterResponse {
    info: {
        count: number;
        pages: number;
        next: string | null;
        prev: string | null;
    };
    results: Character[];
}

const API_BASE_URL = 'https://rickandmortyapi.com/api';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, maxRetries: number = MAX_RETRIES): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

export async function getCharacterCount(): Promise<number> {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/character`);
        const data: CharacterResponse = await response.json();
        return data.info.count;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching character count:', errorMessage);
        throw new Error(`Failed to fetch character count: ${errorMessage}`);
    }
}

export async function getCharacter(id: number): Promise<Character> {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/character/${id}`);
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching character ${id}:`, errorMessage);
        throw new Error(`Failed to fetch character with ID ${id}: ${errorMessage}`);
    }
}

export async function getCharacters(page: number = 1): Promise<CharacterResponse> {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/character?page=${page}`);
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching characters on page ${page}:`, errorMessage);
        throw new Error(`Failed to fetch characters on page ${page}: ${errorMessage}`);
    }
}

export async function searchCharacters(name: string): Promise<CharacterResponse> {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/character/?name=${encodeURIComponent(name)}`);
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error searching characters with name "${name}":`, errorMessage);
        throw new Error(`Failed to search characters with name "${name}": ${errorMessage}`);
    }
}

const FALLBACK_CHARACTER_IDS = [1, 2, 3, 4, 5]; // Rick, Morty, Summer, Beth, Jerry

export async function getRandomCharacter(): Promise<Character> {
    try {
        const characterCount = await getCharacterCount();
        const randomId = Math.floor(Math.random() * characterCount) + 1;
        const character = await getCharacter(randomId);
        console.log(character);
        return character;
    } catch (error) {
        console.warn('Failed to get random character, trying fallback characters:', error);

        // Try fallback characters if random selection fails
        for (const fallbackId of FALLBACK_CHARACTER_IDS) {
            try {
                const character = await getCharacter(fallbackId);
                console.log('Using fallback character:', character);
                return character;
            } catch (fallbackError) {
                console.warn(`Failed to fetch fallback character ${fallbackId}:`, fallbackError);
            }
        }

        // If all else fails, throw the original error
        throw error;
    }
}