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
	72;
	function handleDndFinalize(e: any) {
		items = e.detail.items;
	}
</script>

<div class="flex max-w-4xl py-20 mx-auto h-full px-4">
	<div class="hidden md:flex flex-col h-full">
		<div class="mb-2 border border-gray-500 bg-green-100 flex-grow w-80 flex flex-col">
			<div class="px-4 py-1 border-b border-b-gray-500">strategic goal</div>
			<textarea
				class="p-4 bg-green-100 flex-grow w-full block resize-none focus:outline-none focus:bg-green-200 transition-all"
				placeholder="describe your large-level goals for this project..."
			/>
		</div>
		<div class="mt-2 border border-gray-500 bg-green-100 flex-grow w-80" />
	</div>
	<slot />
</div>
