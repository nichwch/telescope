import { writable } from 'svelte/store';

export const focusedItemStore = writable<string | null>(null);
