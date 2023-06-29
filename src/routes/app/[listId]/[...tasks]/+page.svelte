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
			focusedItems = cleanData(foundTask.children || []);
		}
	}
	let lastFlushedItems: string = JSON.stringify(cleanData([...focusedItems]));
	console.log({ focusedItems, items });

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
		console.log({ allItems, focusedItems, pathToUpdate, topLevelAllItems, items });
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
		console.log(lastFlushedItems);
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

	const createTODO = () => {
		focusedItems = [
			...focusedItems,
			{
				id: nanoid(),
				name: 'new todo'
			}
		];
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

<div class="md:ml-4 h-full flex-grow flex flex-col">
	<div class="pr-10 flex">
		<button class="w-10 py-2 transition-all" on:click={createTODO}>+</button>
		<span class="py-2 pl-4">
			<!-- TODO: make this the list name -->
			<!-- <a href={`/app/${$page.params.listId}`}>listname</a>
			{#each segments?.slice(0, -1) as segment, index}
				<a href={`/app/${$page.params.listId}/${segments.slice(0, index + 1).join('/')}`}
					>{segment}</a
				> /
			{/each} -->
		</span>
	</div>

	<section
		use:dndzone={{ items: focusedItems, flipDurationMs, transformDraggedElement }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
		class="overflow-y-auto flex-grow"
	>
		{#each focusedItems as item (item.id)}
			<div animate:flip={{ duration: flipDurationMs }} in:fly>
				<Todo {item} />
			</div>
		{/each}
	</section>
</div>
