import type { PageServerLoad } from './$types';
import { getRandomCharacter } from '$lib/rickandmorty/character';

const fallbackCharacter = {
    id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    species: "Human",
    type: "",
    gender: "Male",
    origin: {
        name: "Earth (C-137)",
        url: "https://rickandmortyapi.com/api/location/1"
    },
    location: {
        name: "Citadel of Ricks",
        url: "https://rickandmortyapi.com/api/location/3"
    },
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    episode: ["https://rickandmortyapi.com/api/episode/1"],
    url: "https://rickandmortyapi.com/api/character/1",
    created: "2017-11-04T18:48:46.250Z"
};

export const load: PageServerLoad = async () => {
    try {
        const randomCharacter = await getRandomCharacter();
        return {
            character: randomCharacter,
            error: null
        };
    } catch (error) {
        console.error('Failed to load random character, using fallback:', error);
        return {
            character: fallbackCharacter,
            error: 'Failed to load random character from API'
        };
    }
}; 