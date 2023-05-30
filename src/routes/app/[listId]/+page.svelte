<script>
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
	function handleDndConsider(e) {
		items = e.detail.items;
	}
	function handleDndFinalize(e) {
		items = e.detail.items;
	}
	$: {
		console.log(items);
	}
</script>

<div class="p-10 max-w-2xl mx-auto">
	<div>TODOs</div>
	<button
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
	<section
		use:dndzone={{ items, flipDurationMs }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each items as item (item.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				<input placeholder="untitled task" bind:value={item.name} />
			</div>
		{/each}
	</section>
</div>
