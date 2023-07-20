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
	import TitleComponent from '../TitleComponent.svelte';
	import FinishedTodo from '../../../../components/FinishedTodo.svelte';
	import TaskControls from './TaskControls.svelte';
	import { NAME_TEXTAREA_CLASS } from '$lib';
	import { focusedItemStore } from './FocusedItemStore';

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
	let scrollY = 0;
	let scrollHeight = 0;
	let topOrBottomSuggestions: 'top' | 'bottom' | null = null;

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

	const createTODOAtBottom = async () => {
		const newId = nanoid();
		focusedItems = [...focusedItems, createNewTodoWId(newId)];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};

	const addGeneratedTodoAtTop = (evt: { detail: { task: string } }) => {
		focusedItems = [createAIGeneratedNewTodoWName(evt.detail.task), ...focusedItems];
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const addAllGeneratedTodosAtTop = (evt: { detail: { aiSuggestions: string[] } }) => {
		focusedItems = [
			...evt.detail.aiSuggestions.map(createAIGeneratedNewTodoWName),
			...focusedItems
		];
		topOrBottomSuggestions = null;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const addGeneratedTodoAtBottom = (evt: { detail: { task: string } }) => {
		focusedItems = [...focusedItems, createAIGeneratedNewTodoWName(evt.detail.task)];
		topOrBottomSuggestions = null;
		window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
	};

	const addAllGeneratedTodosAtBottom = (evt: { detail: { aiSuggestions: string[] } }) => {
		focusedItems = [
			...focusedItems,
			...evt.detail.aiSuggestions.map(createAIGeneratedNewTodoWName)
		];
		window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
	};

	function handleDndConsider(e: any) {
		focusedItems = e.detail.items;
	}

	function handleDndFinalize(e: any) {
		focusedItems = e.detail.items;
	}

	async function handleEnter(evt: KeyboardEvent) {
		if (evt.key === 'Enter') {
			let classes = Array.from(document.activeElement?.classList || []);
			if (classes.includes(NAME_TEXTAREA_CLASS)) {
				evt.preventDefault();
				let index = focusedItems.findIndex((item) => item.id === $focusedItemStore);
				let newId = nanoid();
				focusedItems.splice(index + 1, 0, createNewTodoWId(newId));
				focusedItems = focusedItems;
				await tick();
				const newTodo = document.getElementById(`input ${newId}`);
				newTodo?.focus();
			}
		}
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
	$: finishedTasks = focusedItems.filter((item) => item.done);
</script>

<!-- <svelte:document bind:offsetHeight={outerHeight} /> -->
<svelte:window bind:scrollY on:resize={() => updateScrollHeight()} on:keydown={handleEnter} />
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

			<TaskControls
				strategic_goal={data.listContent?.[0].strategic_goal || ''}
				{focusedItems}
				{parentItems}
				isSubtask={parentItems.length > 0}
				showAIButton={topOrBottomSuggestions !== 'bottom'}
				on:add_ai_task={addGeneratedTodoAtTop}
				on:add_all={addAllGeneratedTodosAtTop}
				on:create_task={createTODOAtTop}
				on:dismiss={() => (topOrBottomSuggestions = null)}
				on:generate={() => (topOrBottomSuggestions = 'top')}
			/>
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
					<TaskControls
						strategic_goal={data.listContent?.[0].strategic_goal || ''}
						{focusedItems}
						{parentItems}
						isSubtask={parentItems.length > 0}
						showAIButton={topOrBottomSuggestions !== 'top'}
						on:add_ai_task={addGeneratedTodoAtBottom}
						on:add_all={addAllGeneratedTodosAtBottom}
						on:create_task={createTODOAtBottom}
						on:dismiss={() => (topOrBottomSuggestions = null)}
						on:generate={() => (topOrBottomSuggestions = 'bottom')}
						isBottom
					/>
				</div>
			{:else if topOrBottomSuggestions === null}
				<div in:fade class="p-4 pl-0 w-full">
					No {parentItems.length > 0 ? 'sub' : ''}tasks. Add one by pressing the button above
				</div>
			{/if}
		</div>
	</div>
</div>
