<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import { NAME_TEXTAREA_CLASS, taskColors } from '$lib';
	import type { IntermediateTaskWithChildren } from '../lib/types';
	import { focusedItemStore } from '../routes/app/[listId]/[...tasks]/FocusedItemStore';
	import DragHandle from './Icons/DragHandle.svelte';

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
		{#if $focusedItemStore === item.id}
			<label
				class="ml-3 text-sm w-auto p-0.5"
				class:bg-red-500={item.color === 'red'}
				class:bg-orange-500={item.color === 'orange'}
				class:bg-amber-500={item.color === 'amber'}
				class:bg-yellow-500={item.color === 'yellow'}
				class:bg-lime-500={item.color === 'lime'}
				class:bg-green-500={item.color === 'green'}
				class:bg-emerald-500={item.color === 'emerald'}
				class:bg-teal-500={item.color === 'teal'}
				class:bg-cyan-500={item.color === 'cyan'}
				class:bg-sky-500={item.color === 'sky'}
				class:bg-blue-500={item.color === 'blue'}
				class:bg-indigo-500={item.color === 'indigo'}
				class:bg-violet-500={item.color === 'violet'}
				class:bg-purple-500={item.color === 'purple'}
				class:bg-fuchsia-500={item.color === 'fuchsia'}
				class:bg-pink-500={item.color === 'pink'}
				class:bg-rose-500={item.color === 'rose'}
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
		{:else}
			<div
				class="ml-3 text-sm w-5 h-3 inline-block"
				class:bg-red-500={item.color === 'red'}
				class:bg-orange-500={item.color === 'orange'}
				class:bg-amber-500={item.color === 'amber'}
				class:bg-yellow-500={item.color === 'yellow'}
				class:bg-lime-500={item.color === 'lime'}
				class:bg-green-500={item.color === 'green'}
				class:bg-emerald-500={item.color === 'emerald'}
				class:bg-teal-500={item.color === 'teal'}
				class:bg-cyan-500={item.color === 'cyan'}
				class:bg-sky-500={item.color === 'sky'}
				class:bg-blue-500={item.color === 'blue'}
				class:bg-indigo-500={item.color === 'indigo'}
				class:bg-violet-500={item.color === 'violet'}
				class:bg-purple-500={item.color === 'purple'}
				class:bg-fuchsia-500={item.color === 'fuchsia'}
				class:bg-pink-500={item.color === 'pink'}
				class:bg-rose-500={item.color === 'rose'}
			/>
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
