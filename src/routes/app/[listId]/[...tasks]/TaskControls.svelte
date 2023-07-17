<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import AiGeneratedTaskDisplay from './AIGeneratedTaskDisplay.svelte';
	import LoadingRow from './LoadingRow.svelte';
	import { fetchAITaskSuggestions } from '$lib/fetchers';
	import type { TODO } from '$lib/types';

	export let strategic_goal: string;
	export let items: TODO[];
	export let parentItems: TODO[];
	export let isSubtask = false;
	export let showAIButton = true;
	export let isBottom = false;
	let aiSuggestions: string[] | null = null;
	let loadingAISuggestions = false;

	const dispatch = createEventDispatcher();

	const generateTODO = async () => {
		dispatch('generate');
		loadingAISuggestions = true;
		aiSuggestions = await fetchAITaskSuggestions(
			strategic_goal,
			items,
			parentItems[parentItems.length - 1] || []
		);
		loadingAISuggestions = false;
	};
	$: if (aiSuggestions?.length === 0) aiSuggestions = null;
</script>

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
{:else}
	<div class="py-1 text-sm">
		<button class="text-green-700 h-5 hover:underline" on:click={() => dispatch('create_task')}>
			+ create new {isSubtask ? 'sub' : ''}task {isBottom ? 'at bottom' : ''}
		</button>
		{#if showAIButton}
			<button class="text-orange-700 h-5 hover:underline" on:click={generateTODO}>
				+ generate new {isSubtask ? 'sub' : ''}tasks {isBottom ? 'at bottom' : ''}
			</button>
		{/if}
	</div>
{/if}
