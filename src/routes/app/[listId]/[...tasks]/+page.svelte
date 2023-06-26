<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO } from '../../../../utils/types';
	import { onDestroy } from 'svelte';
	import Todo from '../../../../components/Todo.svelte';

	export let data;
	const { supabase } = data;
	const {
		params: { listId, tasks }
	} = $page;

	// remove dnd attributes
	const cleanData = (arr: any[]) => {
		return arr?.map((item) => {
			const newItem = { ...item };
			delete newItem.isDndShadowItem;
			return newItem;
		});
	};

	let items = (data.listContent?.[0].tasks_blob || []) as TODO[];

	let focusedItems: TODO[] = cleanData(items);
	for (let nestedTask of tasks.split('/')) {
		const foundTask = focusedItems.find((task) => task.id === nestedTask);
		if (foundTask) {
			focusedItems = cleanData(foundTask.children || []);
		}
	}
	const updateList = async (
		items: TODO[],
		focusedItems: TODO[],
		pathToUpdate: string[],
		listId: string
	) => {
		let newItems = [...items];
		let listPtr = newItems;
		for (let path of pathToUpdate) {
			const foundItem = listPtr.find((item) => item.id === path);
			if (foundItem?.children) {
				listPtr = foundItem.children;
			} else if (foundItem) {
				foundItem.children = cleanData(focusedItems);
				listPtr = foundItem.children;
			}
		}
		listPtr = cleanData(focusedItems);
		items = newItems;
		return await supabase
			.from('lists')
			.update({
				tasks_blob: newItems
			})
			.eq('id', listId);
	};
	let lastFlushedItems: string = JSON.stringify(cleanData([...focusedItems]));
	let isFlushing = false;

	const updateInterval = setInterval(async () => {
		const currentString = JSON.stringify(cleanData(focusedItems));
		if (lastFlushedItems === currentString) return;
		if (isFlushing) return;
		console.log(lastFlushedItems);
		isFlushing = true;
		updateList(items, focusedItems, tasks.split('/'), listId)
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

	const flipDurationMs = 300;
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
	$: segments = history.split('/');
	$: latestTask = segments?.[segments.length - 1];
</script>

{#key $page.params.tasks}
	<div class="md:ml-4 h-full border border-gray-500 flex-grow bg-green-100 flex flex-col">
		<div class="pr-10 flex border-b border-b-gray-500">
			<button
				class="w-10 border-r border-r-gray-500 py-2 bg-green-100 hover:bg-green-200 transition-all"
				on:click={createTODO}>+</button
			><span class="py-2 pl-4">
				<!-- TODO: make this the list name -->
				<a href={`/app/${$page.params.listId}`}>listname</a>
				{#each segments.slice(0, -1) as segment, index}
					<a href={`/app/${$page.params.listId}/${segments.slice(0, index + 1).join('/')}`}
						>{segment}</a
					> /
				{/each}</span
			>
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
{/key}
