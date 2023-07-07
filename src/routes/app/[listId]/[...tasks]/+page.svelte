<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO } from '../../../../lib/types';
	import { onDestroy } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';
	import { updateAtPath, cleanData } from '$lib';
	import { tick } from 'svelte';
	import { fetchAITaskSuggestions } from '../../../../lib/fetchers';
	import AiGeneratedTaskDisplay from './AIGeneratedTaskDisplay.svelte';

	export let data;
	const { supabase } = data;
	const {
		params: { listId, tasks }
	} = $page;
	const FLIP_DURATION_MS = 300;

	const taskArray = tasks?.split('/').filter((str) => str.length > 0) || [];
	let items = (data.listContent?.[0].tasks_blob || []) as TODO[];
	let isFlushing = false;
	let focusedItems: TODO[] = cleanData(items);
	let parentItems: TODO[] = [];
	let cmdKey = false;
	for (let nestedTask of taskArray || []) {
		const foundTask = focusedItems.find((task) => task.id === nestedTask);
		if (foundTask) {
			parentItems.push(foundTask);
			focusedItems = cleanData(foundTask.children);
		}
	}
	let lastFlushedItems: string = JSON.stringify(cleanData([...focusedItems]));
	let topAISuggestions: string[] | null = null;
	let bottomAISuggestions: string[] | null = null;

	const updateList = async (
		// top level items object
		allItems: TODO[],
		// children to be inserted at pathToUpdate
		focusedItems: TODO[],
		pathToUpdate: string[],
		listId: string
	) => {
		// maintain reference to top level object
		const topLevelAllItems = cleanData(updateAtPath(allItems, focusedItems, pathToUpdate));
		items = topLevelAllItems;
		return await supabase
			.from('lists')
			.update({
				tasks_blob: topLevelAllItems
			})
			.eq('id', listId);
	};

	const updateInterval = setInterval(async () => {
		const currentString = JSON.stringify(cleanData(focusedItems));
		if (lastFlushedItems === currentString) return;
		if (isFlushing) return;
		isFlushing = true;
		updateList(items, focusedItems, taskArray, listId)
			.then(() => {
				isFlushing = false;
				lastFlushedItems = JSON.stringify(cleanData([...focusedItems]));
			})
			.catch((e) => {
				console.error('error while flushing', e);
			});
	}, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});

	const createNewTodo = (id: string) => ({
		id,
		name: '',
		done: false,
		description: '',
		children: []
	});

	const createTODOAtTop = async () => {
		if (cmdKey) {
			topAISuggestions = await fetchAITaskSuggestions(
				data.listContent?.[0].strategic_goal || '',
				items,
				parentItems[parentItems.length - 1] || []
			);
		} else {
			const newId = nanoid();
			focusedItems = [createNewTodo(newId), ...focusedItems];
			await tick();
			const newTodo = document.getElementById(`input ${newId}`);
			newTodo?.focus();
		}
	};

	const createTODOAtBottom = async () => {
		if (cmdKey) {
			bottomAISuggestions = await fetchAITaskSuggestions(
				data.listContent?.[0].strategic_goal || '',
				items,
				parentItems[parentItems.length - 1] || []
			);
		} else {
			const newId = nanoid();
			focusedItems = [...focusedItems, createNewTodo(newId)];
			await tick();
			const newTodo = document.getElementById(`input ${newId}`);
			newTodo?.focus();
		}
	};

	function handleDndConsider(e: any) {
		focusedItems = e.detail.items;
	}

	function handleDndFinalize(e: any) {
		focusedItems = e.detail.items;
	}

	let focusedElement: string | undefined = undefined;
	function transformDraggedElement(element: HTMLElement | undefined) {
		element?.classList.add('border', 'border-black');
		console.log({ element });
		focusedElement = element?.id;
	}

	$: history = $page.params.tasks;
	$: segments = history?.split('/');
	$: latestTask = segments?.[segments.length - 1];

	$: console.log({ cmdKey });
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Meta') cmdKey = true;
	}}
	on:keyup={(e) => {
		if (e.key === 'Meta') cmdKey = false;
	}}
	on:blur={(e) => {
		cmdKey = false;
	}}
/>
<div class="h-full flex-grow flex flex-col">
	<div class="h-full">
		<div>
			{#each parentItems as parentItem, index (parentItem.id)}
				<div>
					<a
						style:margin-left="{index}rem"
						href="/app/{listId}/{segments.slice(0, segments.length - 1).join('/')}"
						class:text-xs={index !== parentItems.length - 1}
						class:text-gray-500={index !== parentItems.length - 1}
						class:border-gray-500={index !== parentItems.length - 1}
						class="px-0.5 mt-0.5 border border-black inline-block hover:bg-gray-200 cursor-pointer transition-all"
						>{parentItem.name}</a
					>
				</div>
			{/each}
			<div style:margin-left="{parentItems.length}rem">
				<div
					class:text-green-700={!cmdKey}
					class:text-amber-600={cmdKey}
					class="py-1 text-sm flex items-center"
				>
					<button class="h-5 hover:underline" on:click={createTODOAtTop}>
						{#if cmdKey}
							+ generate new {parentItems.length > 0 ? 'sub' : ''}tasks
						{:else}
							+ create new {parentItems.length > 0 ? 'sub' : ''}task
							<span class="text-gray-500">(⌘ to use AI)</span>
						{/if}
					</button>
				</div>
				{#if topAISuggestions}
					<AiGeneratedTaskDisplay generatedTasks={topAISuggestions} />
				{/if}
				{#if focusedItems.length > 0}
					<section
						in:fade
						use:dndzone={{
							items: focusedItems,
							flipDurationMs: FLIP_DURATION_MS,
							transformDraggedElement
						}}
						on:consider={handleDndConsider}
						on:finalize={handleDndFinalize}
						class="overflow-y-auto flex-grow block w-full"
					>
						{#each focusedItems as item (item.id)}
							<div animate:flip={{ duration: FLIP_DURATION_MS }} in:fly>
								<Todo {item} />
							</div>
						{/each}
					</section>
					<div
						class:text-green-700={!cmdKey}
						class:text-amber-600={cmdKey}
						class="py-1 text-sm opacity-50 hover:opacity-100 transition-opacity flex items-center"
					>
						<button class="h-5 hover:underline" on:click={createTODOAtBottom}>
							{#if cmdKey}
								+ generate new {parentItems.length > 0 ? 'sub' : ''}tasks at bottom
							{:else}
								+ insert {parentItems.length > 0 ? 'sub' : ''}task at bottom
								<span class="text-gray-500">(⌘ to use AI)</span>
							{/if}
						</button>
					</div>
				{:else}
					<div in:fade class="p-4 pl-0 w-full">No tasks. Add one by pressing the button above</div>
				{/if}
				{#if bottomAISuggestions}
					<AiGeneratedTaskDisplay generatedTasks={bottomAISuggestions} />
				{/if}
			</div>
		</div>
	</div>
</div>
