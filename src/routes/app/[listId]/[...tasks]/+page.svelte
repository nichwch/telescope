<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO } from '../../../../utils/types';
	import { onDestroy } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';
	import { updateAtPath, cleanData } from '../../../../utils';
	import { tick } from 'svelte';

	export let data;
	const { supabase } = data;
	const {
		params: { listId, tasks }
	} = $page;

	const taskArray = tasks?.split('/').filter((str) => str.length > 0) || [];

	let items = (data.listContent?.[0].tasks_blob || []) as TODO[];

	let isFlushing = false;
	const flipDurationMs = 300;
	let focusedItems: TODO[] = cleanData(items);
	for (let nestedTask of taskArray || []) {
		const foundTask = focusedItems.find((task) => task.id === nestedTask);
		if (foundTask) {
			focusedItems = cleanData(foundTask.children);
		}
	}
	let lastFlushedItems: string = JSON.stringify(cleanData([...focusedItems]));

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

	const createTODOAtTop = async () => {
		const newId = nanoid();
		focusedItems = [
			{
				id: newId,
				name: 'new todo',
				done: false,
				children: []
			},
			...focusedItems
		];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};
	const createTODOAtBottom = async () => {
		const newId = nanoid();
		focusedItems = [
			...focusedItems,
			{
				id: newId,
				name: 'new todo',
				done: false,
				children: []
			}
		];
		await tick();
		const newTodo = document.getElementById(`input ${newId}`);
		newTodo?.focus();
	};
	function handleDndConsider(e: any) {
		focusedItems = e.detail.items;
	}
	function handleDndFinalize(e: any) {
		focusedItems = e.detail.items;
	}

	let focusedElement: string | undefined = undefined;
	function transformDraggedElement(element: HTMLElement | undefined) {
		focusedElement = element?.id;
	}

	$: history = $page.params.tasks;
	$: segments = history?.split('/');
	$: latestTask = segments?.[segments.length - 1];
</script>

<div class="h-full flex-grow flex flex-col">
	<div class="h-full">
		<div>
			<div class="py-1 text-sm text-green-700 flex align-center">
				<button class="h-5 transition-all hover:underline" on:click={createTODOAtTop}
					>+ create new task
				</button>
			</div>
			{#if focusedItems.length > 0}
				<section
					in:fade
					use:dndzone={{ items: focusedItems, flipDurationMs, transformDraggedElement }}
					on:consider={handleDndConsider}
					on:finalize={handleDndFinalize}
					class="overflow-y-auto flex-grow block w-full"
				>
					{#each focusedItems as item (item.id)}
						<div animate:flip={{ duration: flipDurationMs }} in:fly>
							<Todo {item} />
						</div>
					{/each}
					<div
						class="py-1 text-sm text-green-700 flex align-center opacity-50 hover:opacity-100 transition-all"
					>
						<button class="h-5 transition-all hover:underline" on:click={createTODOAtBottom}
							>+ insert task at bottom
						</button>
					</div>
				</section>
			{:else}
				<div in:fade class="p-4 pl-0 w-full">No tasks. Add one by pressing +</div>
			{/if}
		</div>
	</div>
</div>
