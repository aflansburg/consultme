// custom error types

class CharacterFilteredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CharacterFilteredError';
    }
}

export { CharacterFilteredError };