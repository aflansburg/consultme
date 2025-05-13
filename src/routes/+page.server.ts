import type { PageServerLoad } from './$types';
import { getRandomCharacter } from '$lib/rickandmorty/character';

export const load: PageServerLoad = async () => {
    const randomCharacter = await getRandomCharacter();
    return {
        character: randomCharacter
    };
}; 