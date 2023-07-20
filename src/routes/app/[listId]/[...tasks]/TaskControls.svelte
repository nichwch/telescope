<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import AiGeneratedTaskDisplay from './AIGeneratedTaskDisplay.svelte';
	import LoadingRow from './LoadingRow.svelte';
	import { fetchAITaskSuggestions } from '$lib/fetchers';
	import type { TODO } from '$lib/types';
	import { fly } from 'svelte/transition';

	export let strategic_goal: string;
	export let focusedItems: TODO[];
	export let parentItems: TODO[];
	export let isSubtask = false;
	export let showAIButton = true;
	export let isBottom = false;
	let aiSuggestions: string[] | null = null;
	let loadingAISuggestions = false;
	let prompting = false;
	let prompt = '';
	const dispatch = createEventDispatcher();

	const cancel = () => {
		prompting = false;
		dispatch('dismiss');
	};
	const generateTODO = async () => {
		prompting = false;
		loadingAISuggestions = true;
		aiSuggestions = await fetchAITaskSuggestions(
			strategic_goal.trim(),
			focusedItems,
			parentItems[parentItems.length - 1] || [],
			prompt.trim()
		);
		loadingAISuggestions = false;
	};
	$: if (aiSuggestions?.length === 0) aiSuggestions = null;
</script>

<svelte:window
	on:keydown={(evt) => {
		if (evt.key === 'Escape') cancel();
		// if (evt.key === 'Enter' && prompting) generateTODO();
	}}
/>
{#if aiSuggestions && !loadingAISuggestions}
	<AiGeneratedTaskDisplay
		generatedTasks={aiSuggestions}
		on:add_task={(evt) => {
			if (aiSuggestions) {
				dispatch('add_ai_task', { task: evt.detail.task });
				aiSuggestions = aiSuggestions?.filter((task) => task !== evt.detail.task);
			}
		}}
		on:add_all={() => {
			if (aiSuggestions) {
				dispatch('add_all', { aiSuggestions });
				aiSuggestions = null;
			}
		}}
		on:dismiss={() => {
			aiSuggestions = null;
			dispatch('dismiss');
		}}
	/>
{:else if loadingAISuggestions}
	<LoadingRow />
{:else if prompting}
	<div class="text-sm bg-orange-50 border border-orange-200 text-orange-500 my-2" in:fly>
		<!-- svelte-ignore a11y-autofocus -->

		<textarea
			autofocus
			bind:value={prompt}
			placeholder="prompt for new tasks (ex: break this task down as if I were a 5th grader, list neighborhoods in New York I should apartment hunt in)"
			class="focus:outline-none resize-none block w-full bg-transparent placeholder:text-orange-500 placeholder:opacity-40 p-2"
		/>
		<div class="p-2 text-xs">
			{#if prompt.trim().length === 0}
				Blank prompt. Will generate tasks without instructions
			{/if}
		</div>
		<div class="border-t border-t-orange-200 flex">
			<button
				class="p-2 bg-orange-100 hover:bg-orange-200 transition-all border-r border-r-orange-200"
				on:click={generateTODO}>generate</button
			>
			<button
				class="p-2 bg-orange-100 hover:bg-orange-200 transition-all border-r border-r-orange-200"
				on:click={cancel}>cancel</button
			>
			<div class="flex-grow bg-texture-orange" />
		</div>
	</div>
{:else}
	<div class="py-1 text-sm">
		<button class="text-green-700 h-5 hover:underline" on:click={() => dispatch('create_task')}>
			+ create new {isSubtask ? 'sub' : ''}task {isBottom ? 'at bottom' : ''}
		</button>
		{#if showAIButton}
			<button
				class="text-orange-700 h-5 hover:underline"
				on:click={() => ((prompting = true), (prompt = ''), dispatch('generate'))}
			>
				+ generate new {isSubtask ? 'sub' : ''}tasks {isBottom ? 'at bottom' : ''}
			</button>
		{/if}
	</div>
{/if}
