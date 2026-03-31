import { writable } from 'svelte/store';

function createColorModeStore() {
    // Dark mode is always on for now
    const { subscribe, set, update } = writable('dark');

    return {
        subscribe,
        set: (_value: string) => {
            // Forced dark mode — ignore set calls
            set('dark');
        },
        update,
        toggle: () => {
            // Forced dark mode — toggle is a no-op
        }
    };
}

export const colorMode = createColorModeStore();
