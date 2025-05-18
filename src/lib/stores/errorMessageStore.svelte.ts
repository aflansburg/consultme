import { writable } from 'svelte/store';
import { generateErrorMessage } from '$lib/utils/generateErrorMessage';

const { subscribe, set } = writable<string>("There was an error. The error was bad.");

// Create a custom store with a refresh method
export const errorMessage = {
    subscribe,
    set,
    refresh: async () => {
        try {
            const newMessage = await generateErrorMessage();
            set(newMessage);
            return newMessage;
        } catch (error) {
            console.error('Failed to refresh error message:', error);
            return null;
        }
    }
};
