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

export async function getCharacterCount(): Promise<number> {
    try {
        const response = await fetch(`${API_BASE_URL}/character`);
        if (!response.ok) {
            throw new Error('Failed to fetch character count');
        }
        const data: CharacterResponse = await response.json();
        return data.info.count;
    } catch (error) {
        console.error('Error fetching character count:', error);
        throw error;
    }
}

export async function getCharacter(id: number): Promise<Character> {
    try {
        const response = await fetch(`${API_BASE_URL}/character/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch character with ID ${id}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching character ${id}:`, error);
        throw error;
    }
}

export async function getCharacters(page: number = 1): Promise<CharacterResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/character?page=${page}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch characters on page ${page}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching characters:', error);
        throw error;
    }
}

export async function searchCharacters(name: string): Promise<CharacterResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/character/?name=${encodeURIComponent(name)}`);
        if (!response.ok) {
            throw new Error(`Failed to search characters with name ${name}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching characters:', error);
        throw error;
    }
}

export async function getRandomCharacter(): Promise<Character> {
    const characterCount = await getCharacterCount();
    const randomId = Math.floor(Math.random() * characterCount) + 1;
    const character = await getCharacter(randomId);
    console.log(character);
    return character;
}