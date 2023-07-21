<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	export let generatedTasks: string[];

	const dispatch = createEventDispatcher();
</script>

<div class="bg-orange-50 border border-orange-200 text-orange-500 my-2" in:fade>
	<div class="px-2 flex bg-orange-100 border-b border-b-orange-200">
		<h1 class="font-semibold inline-block">AI suggested tasks</h1>
	</div>
	{#each generatedTasks as task}
		<button
			class="block w-full text-left px-2 bg-orange-50 hover:bg-orange-100 border-b border-b-orange-200 transition-colors"
			on:click={() => dispatch('add_task', { task })}
		>
			{task}
		</button>
	{/each}
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
