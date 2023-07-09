<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO } from '$lib/types';
	import { onDestroy } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';
	import { updateAtPath, cleanData } from '$lib';
	import { tick } from 'svelte';
	import { fetchAITaskSuggestions } from '$lib/fetchers';
	import AiGeneratedTaskDisplay from './AIGeneratedTaskDisplay.svelte';
	import LoadingSpinner from '../../../../components/Icons/LoadingSpinner.svelte';
	import LoadingRow from './LoadingRow.svelte';

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
	for (let nestedTask of taskArray || []) {
		const foundTask = focusedItems.find((task) => task.id === nestedTask);
		if (foundTask) {
			parentItems.push(foundTask);
			focusedItems = cleanData(foundTask.children);
		}
	}
	let lastFlushedItems: string = JSON.stringify(cleanData([...focusedItems]));
	let topAISuggestions: string[] | null = null;
	let topAILoading = false;
	let bottomAISuggestions: string[] | null = null;
	let bottomAILoading = false;

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
				tasks_blob: topLevelAllItems,
				last_edited_date: new Date().toISOString()
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

	const createNewTodoWId = (id: string): TODO => ({
		id,
		name: '',
		done: false,
		description: '',
		children: []
	});

	const createNewTodoWName = (name: string): TODO => ({
		id: nanoid(),
		name,
		done: false,
		description: '',
		children: []
	});

	const createTODOAtTop = async () => {
		const newId = nanoid();
		focusedItems = [createNewTodoWId(newId), ...focusedItems];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};

	const generateTODOatTop = async () => {
		topAILoading = true;
		topAISuggestions = await fetchAITaskSuggestions(
			data.listContent?.[0].strategic_goal || '',
			items,
			parentItems[parentItems.length - 1] || []
		);
		topAILoading = false;
	};

	const createTODOAtBottom = async () => {
		const newId = nanoid();
		focusedItems = [...focusedItems, createNewTodoWId(newId)];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};

	const generateTODOatBottom = async () => {
		bottomAILoading = true;
		bottomAISuggestions = await fetchAITaskSuggestions(
			data.listContent?.[0].strategic_goal || '',
			items,
			parentItems[parentItems.length - 1] || []
		);
		bottomAILoading = false;
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
	$: if (topAISuggestions?.length === 0) topAISuggestions = null;
	$: if (bottomAISuggestions?.length === 0) bottomAISuggestions = null;
</script>

<svelte:window />
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
				{#if topAISuggestions && !topAILoading}
					<AiGeneratedTaskDisplay
						generatedTasks={topAISuggestions}
						on:add_task={(evt) => {
							if (topAISuggestions) {
								focusedItems = [createNewTodoWName(evt.detail.task), ...focusedItems];
								topAISuggestions = topAISuggestions?.filter((task) => task !== evt.detail.task);
							}
						}}
						on:add_all={() => {
							if (topAISuggestions) {
								focusedItems = [...topAISuggestions.map(createNewTodoWName), ...focusedItems];
								topAISuggestions = null;
							}
						}}
						on:dismiss={() => (topAISuggestions = null)}
					/>
				{:else if topAILoading}
					<LoadingRow />
				{:else}
					<div class="py-1 text-sm">
						<button class="text-green-700 h-5 hover:underline" on:click={createTODOAtTop}>
							+ create new {parentItems.length > 0 ? 'sub' : ''}task
						</button>
						{#if !bottomAISuggestions}
							<button class="text-orange-700 h-5 hover:underline" on:click={generateTODOatTop}>
								+ generate new {parentItems.length > 0 ? 'sub' : ''}tasks
							</button>
						{/if}
					</div>
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
								<Todo
									{item}
									on:delete_item={(e) =>
										(focusedItems = focusedItems.filter((task) => task.id !== e.detail.id))}
								/>
							</div>
						{/each}
					</section>
					{#if bottomAISuggestions && !bottomAILoading}
						<AiGeneratedTaskDisplay
							generatedTasks={bottomAISuggestions}
							on:add_task={(evt) => {
								if (bottomAISuggestions) {
									focusedItems = [...focusedItems, createNewTodoWName(evt.detail.task)];
									bottomAISuggestions = bottomAISuggestions?.filter(
										(task) => task !== evt.detail.task
									);
								}
							}}
							on:add_all={() => {
								if (bottomAISuggestions) {
									focusedItems = [...focusedItems, ...bottomAISuggestions.map(createNewTodoWName)];
									bottomAISuggestions = null;
								}
							}}
							on:dismiss={() => (bottomAISuggestions = null)}
						/>
					{:else if bottomAILoading}
						<LoadingRow />
					{:else}
						<div class="py-1 text-sm">
							<button
								class="text-green-700 h-5 hover:underline opacity-50 hover:opacity-100 transition-opacity"
								on:click={createTODOAtBottom}
							>
								+ insert {parentItems.length > 0 ? 'sub' : ''}task at bottom
							</button>
							{#if !topAISuggestions}
								<button
									class="text-orange-700 h-5 hover:underline opacity-50 hover:opacity-100 transition-opacity"
									on:click={generateTODOatBottom}
								>
									+ generate new {parentItems.length > 0 ? 'sub' : ''}tasks at bottom
								</button>
							{/if}
						</div>
					{/if}
				{:else if topAISuggestions === null && bottomAISuggestions === null}
					<div in:fade class="p-4 pl-0 w-full">
						No {parentItems.length > 0 ? 'sub' : ''}tasks. Add one by pressing the button above
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
