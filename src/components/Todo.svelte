<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { focusedItemStore } from '../routes/app/[listId]/[...tasks]/FocusedItemStore';
	import DragHandle from './Icons/DragHandle.svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import { NAME_TEXTAREA_CLASS } from '$lib';
	import type { IntermediateTaskWithChildren } from '../lib/types';

	export let item: IntermediateTaskWithChildren;
	item.queued_done = Boolean(item.queued_done);
	let interval: NodeJS.Timeout;
	$: {
		if (item.queued_done) {
			interval = setTimeout(() => {
				item.done = true;
			}, 1000);
		} else if (!item.queued_done) {
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
			class="{NAME_TEXTAREA_CLASS} inline-block resize-none break-word overflow-x-hidden flex-grow px-4 focus:outline-none cursor-text"
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
				bind:checked={item.queued_done}
				class="rounded-full outline-none border border-gray-500 align-middle appearance-none h-4 w-4 bg-white checked:bg-green-500"
			/>
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

	<div>
		{#if $focusedItemStore === item.id}
			<a
				class="ml-[14px] pl-4 text-sm w-auto hover:underline text-green-700"
				href={`${$page.url}/${item.id}`}
				on:click={() => invalidateAll()}
			>
				focus on this task
			</a>
		{:else if item.tasks && item.tasks.length > 0}
			<a
				class="ml-[14px] pl-4 text-sm w-auto hover:underline text-green-700"
				href={`${$page.url}/${item.id}`}
				on:click={() => invalidateAll()}
			>
				{item.tasks?.length} subtask{item.tasks.length > 1 ? 's' : ''}
			</a>
		{/if}
		{#if $focusedItemStore === item.id}
			<button
				in:fly
				class="ml-3 text-red-700 hover:underline text-sm w-auto"
				on:click={() => dispatch('delete_item', { id: item.id })}>delete</button
			>
		{/if}
	</div>
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
