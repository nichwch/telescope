<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import Todo from '../../../components/Todo.svelte';
	let items = [
		{ id: '1', name: 'item1' },
		{ id: '2', name: 'item2' },
		{ id: '3', name: 'item3' },
		{ id: '4', name: 'item4' }
	];
	const flipDurationMs = 300;
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
	$: console.log({ focusedElement });
</script>

<div class="md:ml-4 h-full border border-gray-500 flex-grow bg-green-100 flex flex-col">
	<div class="pr-10 flex border-b border-b-gray-500">
		<button
			class="w-10 border-r border-r-gray-500 py-2 bg-green-100 hover:bg-green-200 transition-all"
			on:click={() => {
				items = [
					...items,
					{
						id: nanoid(),
						name: 'new todo'
					}
				];
			}}>+</button
		><span class="py-2 pl-4">TODOs</span>
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
