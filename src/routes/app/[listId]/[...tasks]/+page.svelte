<script lang="ts">
	import FocusedTaskDisplay from './FocusedTaskDisplay.svelte';

	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO, TODOWithMetadata } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';
	import { updateAtPath, cleanData, FLIP_DURATION_MS } from '$lib';
	import { tick } from 'svelte';
	import { fetchAITaskSuggestions } from '$lib/fetchers';
	import AiGeneratedTaskDisplay from './AIGeneratedTaskDisplay.svelte';
	import LoadingRow from './LoadingRow.svelte';
	import TitleComponent from '../TitleComponent.svelte';
	import FinishedTodo from '../../../../components/FinishedTodo.svelte';

	export let data;
	const { supabase } = data;
	const {
		params: { listId, tasks }
	} = $page;

	const taskArray = tasks?.split('/').filter((str) => str.length > 0) || [];

	let items = (data.listContent?.[0].tasks_blob || []) as TODO[];
	let isFlushing = false;
	let focusedItems: TODOWithMetadata[] = items;
	let parentItems: TODO[] = [];
	for (let nestedTask of taskArray || []) {
		const foundTask = focusedItems.find((task) => task.id === nestedTask);
		if (foundTask) {
			parentItems.push(foundTask);
			focusedItems = foundTask.children;
		}
	}
	let focusedTask = parentItems[parentItems.length - 1];
	// wait until to cleanData to make sure parentItems are references to items
	focusedItems = cleanData(focusedItems);

	let lastFlushedItems: string = JSON.stringify([...focusedItems]);
	let topAISuggestions: string[] | null = null;
	let topAILoading = false;
	let bottomAISuggestions: string[] | null = null;
	let bottomAILoading = false;
	let scrollY = 0;
	let scrollHeight = 0;

	let lastFlushedFocusedTask = JSON.stringify(focusedTask);
	const updateList = async (
		// top level items object
		allItems: TODO[],
		// children to be inserted at pathToUpdate
		_focusedItems: TODO[],
		pathToUpdate: string[],
		listId: string
	) => {
		// maintain reference to top level object
		const topLevelAllItems = updateAtPath(allItems, _focusedItems, pathToUpdate);
		items = topLevelAllItems;
		focusedItems = [..._focusedItems];
		return await supabase
			.from('lists')
			.update({
				tasks_blob: cleanData(topLevelAllItems),
				last_edited_date: new Date().toISOString()
			})
			.eq('id', listId);
	};

	const updateInterval = setInterval(async () => {
		// comparison is between cleaned data (to avoid being triggered by drags without drops)
		const currentString = JSON.stringify(cleanData(focusedItems));
		const currentFocusedString = JSON.stringify(focusedTask);
		if (lastFlushedItems === currentString && lastFlushedFocusedTask === currentFocusedString)
			return;
		if (isFlushing) return;
		// put non-reactive changes in
		items = items;
		isFlushing = true;
		updateList(items, focusedItems, taskArray, listId)
			.then(() => {
				isFlushing = false;
				lastFlushedItems = JSON.stringify(cleanData([...focusedItems]));
				lastFlushedFocusedTask = JSON.stringify(focusedTask);
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

	const createAIGeneratedNewTodoWName = (name: string): TODO => ({
		id: nanoid(),
		name,
		done: false,
		description: '',
		children: [],
		aiGenerated: true
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
		focusedElement = element?.id;
	}

	const updateScrollHeight = () => {
		scrollHeight =
			Math.max(
				document.body.scrollHeight,
				document.body.offsetHeight,
				document.documentElement.clientHeight,
				document.documentElement.scrollHeight,
				document.documentElement.offsetHeight
			) - window.innerHeight;
	};
	onMount(() => updateScrollHeight());
	$: history = $page.params.tasks;
	$: segments = history?.split('/');
	$: finishedTasks = focusedItems.filter((item) => item.done);
	$: if (topAISuggestions?.length === 0) topAISuggestions = null;
	$: if (bottomAISuggestions?.length === 0) bottomAISuggestions = null;
</script>

<!-- <svelte:document bind:offsetHeight={outerHeight} /> -->
<svelte:window bind:scrollY on:resize={() => updateScrollHeight()} />
<div class="h-full flex-grow flex flex-col">
	<div class="h-full flex flex-col">
		<div
			class:border-b={scrollY > 75}
			class:border-b-gray-300={scrollY > 75}
			class="sticky top-0 bg-white mt-5 md:mt-20 pt-2 transition-all"
		>
			<a href="/app" class="underline block text-gray-500 text-sm">back to menu</a>
			<TitleComponent {data} />

			<!-- Focused Task display -->
			{#if focusedTask}
				<FocusedTaskDisplay {focusedTask} />
			{/if}

			{#if topAISuggestions && !topAILoading}
				<AiGeneratedTaskDisplay
					generatedTasks={topAISuggestions}
					on:add_task={(evt) => {
						if (topAISuggestions) {
							focusedItems = [createAIGeneratedNewTodoWName(evt.detail.task), ...focusedItems];
							topAISuggestions = topAISuggestions?.filter((task) => task !== evt.detail.task);
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}
					}}
					on:add_all={() => {
						if (topAISuggestions) {
							focusedItems = [
								...topAISuggestions.map(createAIGeneratedNewTodoWName),
								...focusedItems
							];
							topAISuggestions = null;
							window.scrollTo({ top: 0, behavior: 'smooth' });
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
		</div>

		<div class="h-full flex flex-col">
			{#if focusedItems.length > 0}
				<section
					in:fade
					use:dndzone={{
						items: focusedItems.filter((item) => !item.done),
						flipDurationMs: FLIP_DURATION_MS,
						transformDraggedElement
					}}
					on:consider={handleDndConsider}
					on:finalize={handleDndFinalize}
					class="flex-grow block w-full"
				>
					{#each focusedItems.filter((item) => !item.done) as item (item.id)}
						<div animate:flip={{ duration: FLIP_DURATION_MS }} in:fly>
							<Todo
								{item}
								on:delete_item={(e) =>
									(focusedItems = focusedItems.filter((task) => task.id !== e.detail.id))}
							/>
						</div>
					{/each}
				</section>
				<!-- finished tasks -->
				{#if finishedTasks.length > 0}
					<div>
						<h1 class="text-gray-500 text-sm">finished tasks</h1>
						{#each finishedTasks as finishedTask (finishedTask.id)}
							<div animate:flip={{ duration: FLIP_DURATION_MS }} in:fly>
								<FinishedTodo item={finishedTask} />
							</div>
						{/each}
					</div>
				{/if}
				<div
					class:border-t={scrollHeight - scrollY > 75}
					class:border-t-gray-300={scrollHeight - scrollY > 75}
					class="sticky bottom-0 bg-white py-2 transition-all"
				>
					{#if bottomAISuggestions && !bottomAILoading}
						<AiGeneratedTaskDisplay
							generatedTasks={bottomAISuggestions}
							on:add_task={(evt) => {
								if (bottomAISuggestions) {
									focusedItems = [...focusedItems, createAIGeneratedNewTodoWName(evt.detail.task)];
									bottomAISuggestions = bottomAISuggestions?.filter(
										(task) => task !== evt.detail.task
									);
									window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
								}
							}}
							on:add_all={() => {
								if (bottomAISuggestions) {
									focusedItems = [
										...focusedItems,
										...bottomAISuggestions.map(createAIGeneratedNewTodoWName)
									];
									bottomAISuggestions = null;
									window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
								}
							}}
							on:dismiss={() => (bottomAISuggestions = null)}
						/>
					{:else if bottomAILoading}
						<LoadingRow />
					{:else}
						<div class="py-1 text-sm">
							<button
								class="text-green-700 h-5 hover:underline transition-opacity"
								on:click={createTODOAtBottom}
							>
								+ insert {parentItems.length > 0 ? 'sub' : ''}task at bottom
							</button>
							{#if !topAISuggestions}
								<button
									class="text-orange-700 h-5 hover:underline transition-opacity"
									on:click={generateTODOatBottom}
								>
									+ generate new {parentItems.length > 0 ? 'sub' : ''}tasks at bottom
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{:else if topAISuggestions === null && bottomAISuggestions === null}
				<div in:fade class="p-4 pl-0 w-full">
					No {parentItems.length > 0 ? 'sub' : ''}tasks. Add one by pressing the button above
				</div>
			{/if}
		</div>
	</div>
</div>
