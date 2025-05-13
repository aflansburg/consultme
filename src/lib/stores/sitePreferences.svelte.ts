import { writable } from 'svelte/store';

function createColorModeStore() {
    // Get initial value from localStorage or default to 'light'
    const storedMode = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('colorMode') 
        : null;
    
    const { subscribe, set, update } = writable(storedMode || 'light');

    return {
        subscribe,
        set: (value: string) => {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('colorMode', value);
            }
            set(value);
        },
        update,
        toggle: () => {
            update(mode => {
                const newMode = mode === 'dark' ? 'light' : 'dark';
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('colorMode', newMode);
                }
                return newMode;
            });
        }
    };
}

export const colorMode = createColorModeStore();
