import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { getCharacter } from './character';
import { CharacterFilteredError } from '$lib/types/errors';

const mockCharacter = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
    location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z'
};

const filteredCharacter = {
    ...mockCharacter,
    id: 999,
    name: 'Fascist Morty',
};

function mockResponse(data: unknown, ok = true) {
    return new Response(JSON.stringify(data), {
        status: ok ? 200 : 500,
        statusText: ok ? 'OK' : 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('getCharacter', () => {
    let fetchSpy: MockInstance;

    beforeEach(() => {
        fetchSpy = vi.spyOn(global, 'fetch');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns character data on successful fetch', async () => {
        fetchSpy.mockResolvedValueOnce(mockResponse(mockCharacter));

        const result = await getCharacter(1);

        expect(result).toEqual(mockCharacter);
        expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('throws CharacterFilteredError for a filtered character name', async () => {
        fetchSpy.mockResolvedValueOnce(mockResponse(filteredCharacter));

        await expect(getCharacter(999)).rejects.toSatisfy((error: Error) => {
            return error instanceof CharacterFilteredError
                && error.message.includes('Fascist Morty');
        });
    });

    it('throws a generic error on fetch failure', async () => {
        vi.useFakeTimers();

        fetchSpy.mockImplementation(() =>
            Promise.resolve(new Response('', { status: 500, statusText: 'Internal Server Error' }))
        );

        let caughtError: Error | null = null;
        const promise = getCharacter(1).catch((e: Error) => { caughtError = e; });

        // Advance through retry delays (1s, 2s, 4s)
        for (let i = 0; i < 3; i++) {
            await vi.runAllTimersAsync();
        }

        await promise;
        expect(caughtError).toBeInstanceOf(Error);
        expect(caughtError!.message).toContain('Failed to fetch character with ID 1');

        vi.useRealTimers();
    });
});
