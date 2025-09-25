import { writable, derived } from 'svelte/store';

export const name = writable('Rick Sanchez');
export const firstName = derived(name, ($name) => $name.split(' ')[0]);
export const identityRevealed = writable(false);