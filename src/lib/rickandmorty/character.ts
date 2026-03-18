import { CharacterFilteredError } from '$lib/types/errors';

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

// Character IDs confirmed inappropriate via audit (see inappropriate-characters-audit.json)
const FILTERED_CHARACTER_IDS = new Set([
    7,    // Abradolf Lincler
    97,   // Gonorrhea
    98,   // Hepatitis A
    99,   // Hepatitis C
    140,  // Genital Washer
    145,  // Glenn (type: "Eat shiter-Person")
    153,  // Hamster In Butt
    157,  // Hole in the Wall Where The Men Can See It All
    238,  // Mr. Booby Buyer
    271,  // Principal Vagina
    272,  // Principal Vagina
    275,  // Randy Dicknose
    309,  // Scrotian
    359,  // Tortured Morty
    436,  // Giant Testicle Monster
    498,  // Fascist Rick
    499,  // Fascist Morty
    500,  // Fascist Mr. President
    501,  // Fascist Rick's Clone
    503,  // Fascist Shrimp Rick
    504,  // Fascist Shrimp Rick's Clone
    505,  // Fascist Shrimp Morty
    506,  // Fascist Shrimp SS
    507,  // Fascist Teddy Bear Rick
    508,  // Fascist Teddy Bear Rick's Clone
    568,  // Slut Dragon
    573,  // Snake Hitler
    597,  // Abradolf Lincler
    672,  // Mr. Nimbus (type: "Sexy Aquaman")
    726,  // Sticky (type: "Super Sperm Monster")
    750,  // Mousetrap Nipples,
]);

// Fallback pattern matching for any new characters added to the API
const FILTERED_NAME_PATTERNS = [
    'fascist', 'hitler', 'gonorrhea', 'hepatitis', 'syphilis',
    'herpes', 'chlamydia', 'genital', 'vagina', 'dicknose',
    'testicle', 'scrot', 'nipple', 'slut', 'sperm',
];

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

function isCharacterFiltered(character: Character): boolean {
    // Fast path: check ID blocklist
    if (FILTERED_CHARACTER_IDS.has(character.id)) {
        return true;
    }

    // Fallback: pattern match across all text fields for new/unknown characters
    const fields = [
        character.name,
        character.type,
        character.species,
        character.origin?.name,
        character.location?.name,
    ].filter(Boolean).join(' ').toLowerCase();

    return FILTERED_NAME_PATTERNS.some((pattern) => fields.includes(pattern));
}

export async function getCharacter(id: number): Promise<Character> {
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/character/${id}`);
        const data: Character = await response.json();
        if (isCharacterFiltered(data)) {
            console.warn(`Character ${data.name} is filtered`);
            throw new CharacterFilteredError(`Character ${data.name} is filtered`);
        }
        return data;
    } catch (error) {
        if (error instanceof CharacterFilteredError) {
            throw error;
        }
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
        const data: CharacterResponse = await response.json();
        data.results = data.results.filter((c) => !isCharacterFiltered(c));
        console.log(`Filtered characters: ${data.results.map((c) => c.name).join(', ')}`);
        return data;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error searching characters with name "${name}":`, errorMessage);
        throw new Error(`Failed to search characters with name "${name}": ${errorMessage}`);
    }
}

const FALLBACK_CHARACTER_IDS = [1, 2, 3, 4, 5]; // Rick, Morty, Summer, Beth, Jerry

const MAX_FILTER_RETRIES = 3;

export async function getRandomCharacter(): Promise<Character> {
    try {
        const characterCount = await getCharacterCount();
        for (let i = 0; i < MAX_FILTER_RETRIES; i++) {
            try {
                const randomId = Math.floor(Math.random() * characterCount) + 1;
                const character = await getCharacter(randomId);
                console.log(character);
                return character;
            } catch (error) {
                if (error instanceof CharacterFilteredError) {
                    console.warn(`Filtered character hit, retrying (${i + 1}/${MAX_FILTER_RETRIES})`);
                    continue;
                }
                throw error;
            }
        }
        throw new Error('All random character attempts hit filtered characters');
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