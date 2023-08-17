<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import { NAME_TEXTAREA_CLASS, taskColors } from '$lib';
	import type { IntermediateTaskWithChildren, SubscriptionType } from '$lib/types';
	import { focusedItemStore } from '../routes/app/[listId]/[...tasks]/FocusedItemStore';
	import DragHandle from './Icons/DragHandle.svelte';
	import { backgroundColorStore } from '../routes/app/backgroundColorStore';

	export let item: IntermediateTaskWithChildren;
	export let userIsPremium: boolean;
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

<!-- todo class is used to detect clicking away, to reset focusedItemStore -->
<div
	class="todo flex flex-col pb-4 border-b border-b-gray-300 mb-3"
	class:bg-white={$backgroundColorStore === null}
	class:bg-red-50={$backgroundColorStore === 'red'}
	class:bg-orange-50={$backgroundColorStore === 'orange'}
	class:bg-yellow-50={$backgroundColorStore === 'yellow'}
	class:bg-green-50={$backgroundColorStore === 'green'}
	class:bg-blue-50={$backgroundColorStore === 'blue'}
	class:bg-purple-100={$backgroundColorStore === 'purple'}
	class:bg-pink-50={$backgroundColorStore === 'pink'}
>
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
				class="rounded-full outline-none border border-gray-500 align-middle appearance-none h-4 w-4 checked:bg-green-500"
				class:bg-white={$backgroundColorStore === null}
				class:bg-red-50={$backgroundColorStore === 'red'}
				class:bg-orange-50={$backgroundColorStore === 'orange'}
				class:bg-yellow-50={$backgroundColorStore === 'yellow'}
				class:bg-green-50={$backgroundColorStore === 'green'}
				class:bg-blue-50={$backgroundColorStore === 'blue'}
				class:bg-purple-100={$backgroundColorStore === 'purple'}
				class:bg-pink-50={$backgroundColorStore === 'pink'}
			/>
		</div>
	</div>
	{#if $focusedItemStore === item.id || item.description?.length !== 0}
		<span
			in:fly
			contenteditable
			id="description input {item.id}"
			role="textbox"
			class="description_textarea ml-[14px] inline-block resize-none
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

	<div class="ml-[14px] pl-4">
		{#if $focusedItemStore === item.id}
			<a
				class="text-sm w-auto hover:underline text-green-700"
				href={`${$page.url}/${item.id}`}
				on:click={() => invalidateAll()}
			>
				focus on this task
			</a>
		{:else if item.tasks && item.tasks.length > 0}
			<a
				class="text-sm w-auto hover:underline text-green-700"
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
		{#if $focusedItemStore === item.id && userIsPremium}
			<label
				class="ml-3 text-sm w-auto p-0.5"
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
