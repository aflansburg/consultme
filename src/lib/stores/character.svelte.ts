import { writable, type Writable } from 'svelte/store';

export const character: Writable<string> = writable('');
