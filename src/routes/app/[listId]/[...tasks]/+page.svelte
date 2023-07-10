<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';
	import { updateAtPath, cleanData } from '$lib';
	import { tick } from 'svelte';
	import { fetchAITaskSuggestions } from '$lib/fetchers';
	import AiGeneratedTaskDisplay from './AIGeneratedTaskDisplay.svelte';
	import LoadingRow from './LoadingRow.svelte';
	import TitleComponent from '../TitleComponent.svelte';
	import ArrowLeft from '../../../../components/Icons/ArrowLeft.svelte';

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
	let scrollY = 0;
	let scrollHeight = 0;

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
	$: focusedTask = parentItems.length > 0 ? parentItems[parentItems.length - 1] : null;
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
			<!-- {#each parentItems as parentItem, index (parentItem.id)}
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
			{/each} -->
			{#if focusedTask}
				<div class="border border-green-700 bg-green-100 text-green-800" in:fly>
					<div class="px-2 py-0.5">
						<a
							href="/app/{listId}/{segments.slice(0, segments.length - 1).join('/')}"
							class="text-sm opacity-80 underline"
						>
							back
						</a>
						<h2>{focusedTask.name}</h2>
						<p class="opacity-80">{focusedTask.description}</p>
					</div>
				</div>
			{/if}
			{#if topAISuggestions && !topAILoading}
				<AiGeneratedTaskDisplay
					generatedTasks={topAISuggestions}
					on:add_task={(evt) => {
						if (topAISuggestions) {
							focusedItems = [createNewTodoWName(evt.detail.task), ...focusedItems];
							topAISuggestions = topAISuggestions?.filter((task) => task !== evt.detail.task);
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}
					}}
					on:add_all={() => {
						if (topAISuggestions) {
							focusedItems = [...topAISuggestions.map(createNewTodoWName), ...focusedItems];
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
						items: focusedItems,
						flipDurationMs: FLIP_DURATION_MS,
						transformDraggedElement
					}}
					on:consider={handleDndConsider}
					on:finalize={handleDndFinalize}
					class="flex-grow block w-full"
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
									focusedItems = [...focusedItems, createNewTodoWName(evt.detail.task)];
									bottomAISuggestions = bottomAISuggestions?.filter(
										(task) => task !== evt.detail.task
									);
									window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
								}
							}}
							on:add_all={() => {
								if (bottomAISuggestions) {
									focusedItems = [...focusedItems, ...bottomAISuggestions.map(createNewTodoWName)];
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
