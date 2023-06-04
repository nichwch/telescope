<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';

	let items: any[] = [];
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

	$: history = $page.params.tasks;
	$: segments = history.split('/');
	$: latestTask = segments?.[segments.length - 1];
	$: console.log({ history, latestTask, segments });
</script>

{#key $page.params.tasks}
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
			class="overflow-y:scroll"
		>
			{#each items as item (item.id)}
				<div
					id={item.id}
					in:fly
					animate:flip={{ duration: flipDurationMs }}
					class:border={focusedElement === item.id}
					class:border-gray-500={focusedElement === item.id}
					class:border-b={focusedElement !== item.id}
					class:border-b-gray-500={focusedElement !== item.id}
					class="flex"
				>
					<div class="w-10 h-10 bg-slate-200 inline-block border-r border-r-gray-500" />
					<textarea
						class="h-10 resize-none whitespace-nowrap flex-grow px-4 py-2"
						placeholder="untitled task"
						bind:value={item.name}
					/>
					<a href={`${$page.url}/${item.id}`}>expand</a>
				</div>
			{/each}
		</section>
	</div>
{/key}
