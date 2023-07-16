<script lang="ts">
	import { page } from '$app/stores';
	import type { TODO, TODOWithMetadata } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { focusedItemStore } from '../routes/app/[listId]/[...tasks]/FocusedItemStore';
	import DragHandle from './Icons/DragHandle.svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';

	export let item: TODOWithMetadata;
	item.queuedDone = Boolean(item.queuedDone);
	let interval: NodeJS.Timeout;
	$: {
		if (item.queuedDone) {
			interval = setTimeout(() => {
				item.done = true;
			}, 1000);
		} else if (!item.queuedDone) {
			clearTimeout(interval);
			item.done = false;
		}
	}

	export const delete_item = 'delete_item';
	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col pb-4 border-b border-b-gray-300 mb-3 bg-white">
	<div class="flex items-center">
		<DragHandle />
		<span
			contenteditable
			id="input {item.id}"
			role="textbox"
			class="name_textarea inline-block resize-none break-word overflow-x-hidden flex-grow px-4 focus:outline-none cursor-text"
			bind:innerText={item.name}
			on:focus={() => {
				focusedItemStore.set(item.id);
			}}
		>
			{item.name}
		</span>
		<div class="flex items-center">
			<input
				type="checkbox"
				bind:checked={item.queuedDone}
				class="rounded-full outline-none border border-gray-500 align-middle appearance-none h-4 w-4 bg-white checked:bg-green-500"
			/>
			<a
				class:text-green-700={item.children.length > 0}
				class:font-semibold={item.children.length > 0}
				class:text-gray-500={item.children.length === 0}
				class="w-6 text-center"
				href={`${$page.url}/${item.id}`}
				on:click={() => invalidateAll()}
			>
				{#if item.children.length > 0}
					{item.children.length}
				{:else}
					+
				{/if}
			</a>
		</div>
	</div>
	{#if $focusedItemStore === item.id || item.description?.length !== 0}
		<span
			in:fly
			contenteditable
			id="description input {item.id}"
			role="textbox"
			class="ml-[14px] description_textarea inline-block resize-none
	break-word overflow-x-hidden flex-grow px-4 focus:outline-none cursor-text
	text-gray-500"
			bind:innerText={item.description}
			on:focus={() => {
				focusedItemStore.set(item.id);
			}}
		>
			{item.description}
		</span>
	{/if}
	{#if $focusedItemStore === item.id}
		<div>
			<button
				in:fly
				class=" ml-[14px] pl-4 text-red-700 hover:underline text-sm w-auto"
				on:click={() => dispatch('delete_item', { id: item.id })}>delete</button
			>
		</div>
	{/if}
</div>

<style>
	.name_textarea[contenteditable]:empty::before {
		content: 'untitled task';
		color: gray;
	}

	.description_textarea[contenteditable]:empty::before {
		content: 'add a description...';
		color: gray;
	}
</style>
