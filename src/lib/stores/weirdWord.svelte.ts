import { writable } from 'svelte/store';
import { generateWeirdWord } from '$lib/utils/weirdWordGenerator';

// Initialize with a random weird word
export const weirdWord = writable(generateWeirdWord()); 