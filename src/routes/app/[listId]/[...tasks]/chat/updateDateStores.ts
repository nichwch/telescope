import { writable } from 'svelte/store';

export const lastEditedStore = writable(new Date());
export const lastContextUpdated = writable(new Date());
