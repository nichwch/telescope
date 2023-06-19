<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import Todo from '../../../../components/Todo.svelte';
	import type { TODO } from '../../../../utils/types';
	import { onDestroy } from 'svelte';

	export let data;
	const { supabase } = data;

	// remove dnd attributes
	const cleanData = (arr: any[]) => {
		return arr?.map((item) => {
			const newItem = { ...item };
			delete newItem.isDndShadowItem;
			return newItem;
		});
	};

	const updateList = async (items: TODO[], listId: string) => {
		return await supabase
			.from('lists')
			.update({
				tasks_blob: items
			})
			.eq('id', listId);
	};
	$: listId = $page.params.listId;

	let items = cleanData((data.listContent?.[0].tasks_blob as TODO[]) || []);
	let lastFlushedItems: string = JSON.stringify(cleanData([...items]));
	let isFlushing = false;

	const updateInterval = setInterval(async () => {
		const currentString = JSON.stringify(cleanData(items));
		if (lastFlushedItems === currentString) return;
		if (isFlushing) return;
		isFlushing = true;
		updateList(items, listId)
			.then(() => {
				isFlushing = false;
				lastFlushedItems = JSON.stringify(cleanData([...items]));
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
		items = [
			...items,
			{
				id: nanoid(),
				name: 'new todo'
			}
		];
	};
	function handleDndConsider(e: any) {
		items = e.detail.items;
	}
	function handleDndFinalize(e: any) {
		items = e.detail.items;
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
			use:dndzone={{ items, flipDurationMs, transformDraggedElement }}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
			class="overflow-y-auto flex-grow"
		>
			{#each items as item (item.id)}
				<div animate:flip={{ duration: flipDurationMs }} in:fly>
					<Todo {item} />
				</div>
			{/each}
		</section>
	</div>
{/key}
