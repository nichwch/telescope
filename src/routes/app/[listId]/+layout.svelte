<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';

	export let data;
	const { supabase } = data;
	$: strategic_goal_input = data.listContent?.[0].strategic_goal || '';
	// $: strategic_goal_input = data.listContent?.[0].strategic_goal || '';
	let last_strategic_goal_input = strategic_goal_input;
	let isFlushing = false;
	const updateInterval = setInterval(async () => {
		if (strategic_goal_input === last_strategic_goal_input) return;
		if (isFlushing) return;
		isFlushing = true;
		console.log('flushing', strategic_goal_input);
		supabase
			.from('lists')
			.update({
				strategic_goal: strategic_goal_input
			})
			.eq('id', $page.params.listId)
			.then((res) => {
				console.log('flushed!');
				isFlushing = false;
				last_strategic_goal_input = strategic_goal_input;
			});
	}, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});
</script>

{#key $page.params.listId}
	<div class="flex max-w-4xl py-20 mx-auto h-full px-4" transition:fade>
		<div class="hidden md:flex flex-col h-full">
			<div class="mb-2 border border-gray-500 bg-green-100 flex-grow w-80 flex flex-col">
				<div class="px-4 py-1 border-b border-b-gray-500">strategic goal</div>
				<textarea
					bind:value={strategic_goal_input}
					class="p-4 bg-green-100 flex-grow w-full block resize-none focus:outline-none focus:bg-green-200 transition-all"
					placeholder="describe your large-level goals for this project..."
				/>
			</div>
			<div class="mt-2 border border-gray-500 bg-green-100 flex-grow w-80" />
		</div>
		<slot />
	</div>
{/key}
