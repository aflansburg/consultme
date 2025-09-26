import { json } from '@sveltejs/kit';
import { getRandomCharacter } from '$lib/rickandmorty/character';
import type { RequestHandler } from './$types';

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

export const GET: RequestHandler = async () => {
    try {
        const randomCharacter = await getRandomCharacter();
        const sanitizedCharacter = {
            ...randomCharacter,
            status: randomCharacter.status === 'Dead' ? 'Deceased' : randomCharacter.status,
        };
        return json(sanitizedCharacter);
    } catch (error) {
        console.error('Failed to load random character, using fallback:', error);
        return json(fallbackCharacter);
    }
};