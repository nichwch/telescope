<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { nanoid } from 'nanoid';
	let items = [
		{ id: 1, name: 'item1' },
		{ id: 2, name: 'item2' },
		{ id: 3, name: 'item3' },
		{ id: 4, name: 'item4' }
	];
	const flipDurationMs = 300;
	function handleDndConsider(e: any) {
		items = e.detail.items;
	}
	function handleDndFinalize(e: any) {
		items = e.detail.items;
	}
</script>

<div class="md:ml-4 h-full border border-gray-500 flex-grow bg-green-100 flex flex-col">
	<div class="px-10 py-2 flex border-b border-b-gray-500">
		TODOs <button
			on:click={() => {
				items = [
					...items,
					{
						id: nanoid(),
						name: 'new todo'
					}
				];
			}}>add todo</button
		>
	</div>

	<section
		use:dndzone={{ items, flipDurationMs }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each items as item (item.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				<div class="w-10 h-5 bg-slate-200 inline-block" />
				<textarea class="h-5 resize-none" placeholder="untitled task" bind:value={item.name} />
			</div>
		{/each}
	</section>
</div>
