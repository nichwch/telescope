import { writable } from 'svelte/store';
import type { IntermediateTask } from '$lib/types';

export const currentTaskStore = writable<IntermediateTask | null>(null);
