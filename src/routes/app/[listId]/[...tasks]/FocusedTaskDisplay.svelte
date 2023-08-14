<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { IntermediateTask } from '$lib/types';
	import { onDestroy } from 'svelte';
	import { currentTaskStore } from './currentTaskStore';

	export let focusedTask: IntermediateTask;
	const {
		params: { listId },
		data: { supabase }
	} = $page;

	let description = focusedTask.description;
	let lastFlushedDescription = description;
	let name = focusedTask.name;
	let lastFlushedName = name;
	let flushing = false;
	$: currentTaskStore.set({
		...focusedTask,
		description,
		name
	});

	$: history = $page.params.tasks;
	$: segments = history?.split('/');

	const updateFunction = async () => {
		if (lastFlushedDescription === description && lastFlushedName === name) return;
		if (flushing) return;
		flushing = true;
		await supabase.from('tasks').update({ description, name }).match({ id: focusedTask.id });
		flushing = false;
		lastFlushedDescription = description;
		lastFlushedName = name;
	};
	const updateInterval = setInterval(updateFunction, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});
</script>

<div class="border border-green-700 bg-green-50 text-green-800 flex flex-col" in:fly>
	<div class="p-2">
		<div
			contenteditable
			role="textbox"
			class="block name_textarea resize-none break-word overflow-x-hidden flex-grow focus:outline-none cursor-text"
			bind:innerText={name}
		/>
		<div
			contenteditable
			role="textbox"
			class="block description_textarea resize-none
	break-word overflow-x-hidden flex-grow focus:outline-none cursor-text"
			bind:innerText={description}
		/>
	</div>
	<div class="flex border-t border-t-green-700">
		<a
			href="."
			class="p-2 bg-green-100 hover:bg-green-200 transition-all border-r border-r-green-700 text-sm"
		>
			back
		</a>
		<a
			href="{$page.url}/chat"
			class="p-2 bg-green-100 hover:bg-green-200 transition-all border-r border-r-green-700 text-sm"
		>
			ask AI for help
		</a>
		<div class="flex-grow bg-texture-green" />
	</div>
</div>

<style>
	.name_textarea[contenteditable]:empty::before {
		content: 'untitled task';
		color: inherit;
		opacity: 50%;
	}

	.description_textarea[contenteditable]:empty::before {
		content: 'add a description...';
		color: inherit;
		opacity: 50%;
	}
</style>
