<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { focusedItemStore } from '../routes/app/[listId]/[...tasks]/FocusedItemStore';
	import { fly } from 'svelte/transition';
	import type { IntermediateTaskWithChildren } from '../lib/types';
	import { themeStore } from '../routes/app/themeStore';
	import { taskColors } from '../lib';

	export let item: IntermediateTaskWithChildren;
	export let userIsPremium: boolean;
	item.queued_done = Boolean(item.queued_done);
	export const delete_item = 'delete_item';
	const dispatch = createEventDispatcher();
</script>

<!-- todo class is used to detect clicking away, to reset focusedItemStore -->
<div
	class="todo flex flex-col pb-4 border-b border-b-gray-300 mb-3 opacity-50"
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
	<div class="pl-4">
		{#if $focusedItemStore === item.id}
			<button
				in:fly
				class=" text-red-700 hover:underline text-sm w-auto"
				on:click={() => dispatch('delete_item', { id: item.id })}>delete</button
			>
		{/if}
		{#if $focusedItemStore === item.id && userIsPremium}
			<label
				class="text-sm w-auto p-0.5"
				class:bg-red-200={item.color === 'red'}
				class:text-red-900={item.color === 'red'}
				class:bg-orange-200={item.color === 'orange'}
				class:text-orange-900={item.color === 'orange'}
				class:bg-yellow-200={item.color === 'yellow'}
				class:text-yellow-900={item.color === 'yellow'}
				class:bg-green-200={item.color === 'green'}
				class:text-green-900={item.color === 'green'}
				class:bg-blue-200={item.color === 'blue'}
				class:text-blue-900={item.color === 'blue'}
				class:bg-purple-200={item.color === 'purple'}
				class:text-purple-900={item.color === 'purple'}
				class:bg-pink-200={item.color === 'pink'}
				class:text-pink-900={item.color === 'pink'}
			>
				select color
				<select bind:value={item.color}>
					<option value={null}>none</option>
					{#each taskColors as color}
						<option value={color}>
							{color}
						</option>
					{/each}
				</select>
			</label>
		{:else if userIsPremium}
			<div
				class="text-sm w-auto px-0.5 inline-block"
				class:bg-red-200={item.color === 'red'}
				class:text-red-900={item.color === 'red'}
				class:bg-orange-200={item.color === 'orange'}
				class:text-orange-900={item.color === 'orange'}
				class:bg-yellow-200={item.color === 'yellow'}
				class:text-yellow-900={item.color === 'yellow'}
				class:bg-green-200={item.color === 'green'}
				class:text-green-900={item.color === 'green'}
				class:bg-blue-200={item.color === 'blue'}
				class:text-blue-900={item.color === 'blue'}
				class:bg-purple-200={item.color === 'purple'}
				class:text-purple-900={item.color === 'purple'}
				class:bg-pink-200={item.color === 'pink'}
				class:text-pink-900={item.color === 'pink'}
			>
				{item.color || ''}
			</div>
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
