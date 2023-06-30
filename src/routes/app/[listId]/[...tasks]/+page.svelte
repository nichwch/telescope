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
	import { Icon, Plus } from 'svelte-hero-icons';
	import PlusIcon from '../../../../components/Icons/PlusIcon.svelte';

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
			{
				id: nanoid(),
				name: 'new todo'
			},
			...focusedItems
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

<div class="h-full flex-grow flex flex-col">
	<div class="h-full">
		<div>
			<div class="py-1 text-sm text-green-700 flex align-center">
				<button class="h-5 transition-all hover:underline" on:click={createTODO}
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
				</section>
			{:else}
				<div in:fade class="p-4 w-full">No tasks. Add one by pressing +</div>
			{/if}
		</div>
	</div>
</div>
