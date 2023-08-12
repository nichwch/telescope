<script lang="ts">
	import FocusedTaskDisplay from './FocusedTaskDisplay.svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type {
		IntermediateTask,
		IntermediateTaskWithChildren,
		IntermediateTaskWithIndex,
		Task
	} from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';
	import { FLIP_DURATION_MS, cleanData, diffLists } from '$lib';
	import { tick } from 'svelte';
	import TitleComponent from '../TitleComponent.svelte';
	import FinishedTodo from '../../../../components/FinishedTodo.svelte';
	import TaskControls from './TaskControls.svelte';
	import { NAME_TEXTAREA_CLASS } from '$lib';
	import { focusedItemStore } from './FocusedItemStore';
	import { itemStore } from './itemStore';

	export let data;
	const { supabase } = data;
	const {
		params: { listId, tasks }
	} = $page;

	const taskArray = tasks?.split('/').filter((str) => str.length > 0) || [];

	let isFlushing = false;
	let items: IntermediateTaskWithChildren[] = data.items;
	let lastFlushedItems: IntermediateTask[] = cleanData(items);
	let focusedTask: IntermediateTask | null = data.currentTask;
	let prevTaskMap: Map<string, IntermediateTaskWithIndex> = new Map();
	lastFlushedItems.forEach((task, index) =>
		prevTaskMap.set(task.id, { ...task, child_index: index })
	);

	$: itemStore.set(items);

	let scrollY = 0;
	let scrollHeight = 0;
	let topOrBottomSuggestions: 'top' | 'bottom' | null = null;

	const updateFunction = async () => {
		// check for difference between last flushed items and current items
		// comparison is between cleaned data (to avoid being triggered by drags without drops)
		let itemsWithoutChildren: IntermediateTask[] = cleanData(items);
		if (JSON.stringify(itemsWithoutChildren) === JSON.stringify(lastFlushedItems) || isFlushing)
			return;

		// find differences between last flushed items and current items
		// for each of the differences, flush to the server

		/*
		whitepill: I don't think you actually need a transaction here!
		if a create fails, all updates on that task will fail. this is bad, but 
		you can just refresh the page and it will be fine. 
		if an update fails, subsequent updates to the same task will fill it in
		if a delete fails, you just have the delete the task after updating again.

		upserts can partially fix failed creates. if you update the task after you create it
		and upsert it, and the first creation fails, the second update will create it instead 
		of updating.

		hm, how about out of order updates? we can fix this by waiting to flush updates again
		after Promise.all()
		*/
		isFlushing = true;
		const { changed, deleted, currentMap } = diffLists(
			itemsWithoutChildren,
			lastFlushedItems,
			prevTaskMap
		);
		// created_at is filled in automatically by postgres with an automatic value
		// this prevents upserts from incorrectly setting created_at to the last update date
		const changedRows: Omit<Task, 'created_at' | 'chats'>[] = changed.map((change) => {
			return {
				...change,
				list_parent: focusedTask ? null : listId,
				task_parent: focusedTask ? focusedTask.id : null,
				owner: $page.data.session!.user.id
			};
		});

		const deleteOperations = deleted.map((rowId) =>
			supabase.from('tasks').delete().match({ id: rowId })
		);
		await Promise.all([
			supabase.from('tasks').upsert(changedRows),
			...deleteOperations,
			supabase
				.from('lists')
				.update({ last_edited_date: new Date().toISOString() })
				.match({ id: listId })
		]);
		prevTaskMap = currentMap;
		lastFlushedItems = itemsWithoutChildren;
		items = items;
		isFlushing = false;
	};
	const updateInterval = setInterval(updateFunction, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});

	const createNewTodoWId = (id: string): IntermediateTaskWithChildren => ({
		id,
		name: '',
		done: false,
		description: '',
		queued_done: false,
		ai_generated: false,
		tasks: []
	});

	const createAIGeneratedNewTodoWName = (name: string): IntermediateTaskWithChildren => ({
		id: nanoid(),
		name,
		done: false,
		description: '',
		ai_generated: true,
		queued_done: false,
		tasks: []
	});

	const createTODOAtTop = async () => {
		const newId = nanoid();
		items = [createNewTodoWId(newId), ...items];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};

	const createTODOAtBottom = async () => {
		const newId = nanoid();
		items = [...items, createNewTodoWId(newId)];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};

	const addGeneratedTodoAtTop = (evt: { detail: { task: string } }) => {
		items = [createAIGeneratedNewTodoWName(evt.detail.task), ...items];
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const addAllGeneratedTodosAtTop = (evt: { detail: { aiSuggestions: string[] } }) => {
		items = [...evt.detail.aiSuggestions.map(createAIGeneratedNewTodoWName), ...items];
		topOrBottomSuggestions = null;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const addGeneratedTodoAtBottom = (evt: { detail: { task: string } }) => {
		items = [...items, createAIGeneratedNewTodoWName(evt.detail.task)];
		topOrBottomSuggestions = null;
		window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
	};

	const addAllGeneratedTodosAtBottom = (evt: { detail: { aiSuggestions: string[] } }) => {
		items = [...items, ...evt.detail.aiSuggestions.map(createAIGeneratedNewTodoWName)];
		window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
	};

	function handleDndConsider(e: any) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: any) {
		items = e.detail.items;
	}

	async function handleEnter(evt: KeyboardEvent) {
		if (evt.key === 'Enter') {
			let classes = Array.from(document.activeElement?.classList || []);
			if (classes.includes(NAME_TEXTAREA_CLASS)) {
				evt.preventDefault();
				let index = items.findIndex((item) => item.id === $focusedItemStore);
				let newId = nanoid();
				items.splice(index + 1, 0, createNewTodoWId(newId));
				items = items;
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
	$: finishedTasks = items.filter((item) => item.done);
</script>

<!-- <svelte:document bind:offsetHeight={outerHeight} /> -->
<svelte:window bind:scrollY on:resize={() => updateScrollHeight()} on:keydown={handleEnter} />
<slot />
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
				focusedItems={items}
				{focusedTask}
				isSubtask={taskArray.length > 0}
				showAIButton={topOrBottomSuggestions !== 'bottom'}
				on:add_ai_task={addGeneratedTodoAtTop}
				on:add_all={addAllGeneratedTodosAtTop}
				on:create_task={createTODOAtTop}
				on:dismiss={() => (topOrBottomSuggestions = null)}
				on:generate={() => (topOrBottomSuggestions = 'top')}
				title={data.listContent?.[0].name}
			/>
		</div>

		<div class="h-full flex flex-col">
			{#if items.length > 0}
				<section
					in:fade
					use:dndzone={{
						items: items.filter((item) => !item.done),
						flipDurationMs: FLIP_DURATION_MS,
						transformDraggedElement
					}}
					on:consider={handleDndConsider}
					on:finalize={handleDndFinalize}
					class="flex-grow block w-full"
				>
					{#each items.filter((item) => !item.done) as item (item.id)}
						<div animate:flip={{ duration: FLIP_DURATION_MS }} in:fly>
							<Todo
								{item}
								on:delete_item={(e) => (items = items.filter((task) => task.id !== e.detail.id))}
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
						focusedItems={items}
						{focusedTask}
						isSubtask={taskArray.length > 0}
						showAIButton={topOrBottomSuggestions !== 'top'}
						on:add_ai_task={addGeneratedTodoAtBottom}
						on:add_all={addAllGeneratedTodosAtBottom}
						on:create_task={createTODOAtBottom}
						on:dismiss={() => (topOrBottomSuggestions = null)}
						on:generate={() => (topOrBottomSuggestions = 'bottom')}
						isBottom
						title={data.listContent?.[0].name}
					/>
				</div>
			{:else if topOrBottomSuggestions === null}
				<div in:fade class="p-4 pl-0 w-full">
					No {taskArray.length > 0 ? 'sub' : ''}tasks. Add one by pressing the button above
				</div>
			{/if}
		</div>
	</div>
</div>
