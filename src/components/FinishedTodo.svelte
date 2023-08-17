<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { focusedItemStore } from '../routes/app/[listId]/[...tasks]/FocusedItemStore';
	import { fly } from 'svelte/transition';
	import type { IntermediateTaskWithChildren } from '../lib/types';
	import { themeStore } from '../routes/app/themeStore';

	export let item: IntermediateTaskWithChildren;
	item.queued_done = Boolean(item.queued_done);
	export const delete_item = 'delete_item';
	const dispatch = createEventDispatcher();
</script>

<div
	class="flex flex-col pb-4 border-b border-b-gray-300 mb-3 opacity-50"
	class:bg-white={$themeStore === null}
	class:bg-red-50={$themeStore === 'red'}
	class:bg-orange-50={$themeStore === 'orange'}
	class:bg-yellow-50={$themeStore === 'yellow'}
	class:bg-green-50={$themeStore === 'green'}
	class:bg-blue-50={$themeStore === 'blue'}
	class:bg-purple-100={$themeStore === 'purple'}
	class:bg-pink-50={$themeStore === 'pink'}
>
	<div class="flex items-center">
		<!-- <DragHandle /> -->
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
				checked={item.done}
				on:click={() => {
					item.done = false;
					item.queued_done = false;
				}}
				class="rounded-full outline-none border border-gray-500 align-middle appearance-none h-4 w-4 checked:bg-green-500"
				class:bg-white={$themeStore === null}
				class:bg-red-50={$themeStore === 'red'}
				class:bg-orange-50={$themeStore === 'orange'}
				class:bg-yellow-50={$themeStore === 'yellow'}
				class:bg-green-50={$themeStore === 'green'}
				class:bg-blue-50={$themeStore === 'blue'}
				class:bg-purple-100={$themeStore === 'purple'}
				class:bg-pink-50={$themeStore === 'pink'}
			/>
			<a
				class:text-green-700={item.tasks && item.tasks.length > 0}
				class:font-semibold={item.tasks && item.tasks.length > 0}
				class:text-gray-500={item.tasks?.length === 0}
				class="w-6 text-center"
				href={`${$page.url}/${item.id}`}
			>
				{#if item.tasks && item.tasks.length > 0}
					{item.tasks?.length}
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
			class="description_textarea inline-block resize-none
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
				class="pl-4 text-red-700 hover:underline text-sm w-auto"
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
