import type { PageServerLoad } from './$types';

const placeholderCharacter = {
    id: 0,
    name: "Loading...",
    status: "Unknown",
    species: "Unknown",
    type: "",
    gender: "Unknown",
    origin: {
        name: "Loading...",
        url: ""
    },
    location: {
        name: "Loading...",
        url: ""
    },
    image: "/placeholder-character.svg",
    episode: [],
    url: "",
    created: ""
};

export const load: PageServerLoad = async () => {
    return {
        character: placeholderCharacter,
        error: null
    };
}; 