<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { fade } from 'svelte/transition';
	import { FLIP_DURATION_MS } from '$lib';
	import { flip } from 'svelte/animate';
	import DragHandle from '../../../../components/Icons/DragHandle.svelte';
	import { nanoid } from 'nanoid';

	export let generatedTasks: string[];
	$: generatedItems = generatedTasks.map((task) => ({
		id: nanoid(),
		name: task,
		description: ''
	}));

	const dispatch = createEventDispatcher();

	function transformDraggedElement(element: HTMLElement | undefined) {}

	function handleDndConsider(e: any) {
		generatedItems = e.detail.items;
	}

	function handleDndFinalize(e: any) {
		generatedItems = e.detail.items;
	}
</script>

<div class="bg-orange-50 border border-orange-200 text-orange-500 my-2" in:fade>
	<div class="px-2 flex bg-orange-100 border-b border-b-orange-200">
		<h1 class="font-semibold inline-block">AI suggested tasks</h1>
	</div>
	<section
		use:dndzone={{
			items: generatedItems,
			flipDurationMs: FLIP_DURATION_MS,
			transformDraggedElement,
			dropFromOthersDisabled: true
		}}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
		class="flex-grow block w-full"
	>
		{#each generatedItems as task (task.id)}
			<div animate:flip={{ duration: FLIP_DURATION_MS }}>
				<div
					class="flex justify-start items-center w-full text-left px-1 bg-orange-50 hover:bg-orange-100 border-b border-b-orange-200 transition-colors"
				>
					<span class="opacity-50 fill-orange-500">
						<DragHandle />
					</span>

					<button
						class="ml-1 flex-grow cursor-pointer text-left"
						on:click={() => dispatch('add_task', { task: task.name })}
					>
						{task.name}
					</button>
				</div>
			</div>
		{/each}
	</section>
	<div class="flex bg-orange-100">
		<button
			class="p-2 bg-orange-100 hover:bg-orange-200 transition-all border-r border-r-orange-200"
			on:click={() => dispatch('add_all')}>add all</button
		>
		<button
			class="p-2 bg-orange-100 hover:bg-orange-200 transition-all border-r border-r-orange-200"
			on:click={() => dispatch('retry')}>retry</button
		>
		<button
			class="p-2 bg-orange-100 hover:bg-orange-200 transition-all border-r border-r-orange-200"
			on:click={() => dispatch('change_prompt')}>change prompt</button
		>
		<button
			class="p-2 bg-orange-100 hover:bg-orange-200 transition-all border-r border-r-orange-200"
			on:click={() => dispatch('dismiss')}>dismiss</button
		>
		<div class="flex-grow bg-texture-orange" />
	</div>
</div>
