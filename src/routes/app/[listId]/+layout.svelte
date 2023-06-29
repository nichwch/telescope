<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';

	export let data;
	const { supabase } = data;
	let strategic_goal_input = $page.data.listContent?.[0].strategic_goal || '';

	let last_strategic_goal_input = strategic_goal_input;
	let isFlushing = false;
	const updateInterval = setInterval(async () => {
		if (strategic_goal_input === last_strategic_goal_input) return;
		if (isFlushing) return;
		isFlushing = true;
		supabase
			.from('lists')
			.update({
				strategic_goal: strategic_goal_input
			})
			.eq('id', $page.params.listId)
			.then(() => {
				isFlushing = false;
				last_strategic_goal_input = strategic_goal_input;
			});
	}, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});

	const changeHandler = (e: KeyboardEvent) => {
		strategic_goal_input = (e?.target as HTMLTextAreaElement)?.value || '';
	};
</script>

<div class="flex max-w-4xl py-20 mx-auto h-full px-4" transition:fade>
	<div class="hidden md:flex flex-col h-full">
		<div class="mb-2 flex-grow w-80 flex flex-col">
			<div class="px-4 py-1 text-gray-500 text-sm text-right">strategic goal:</div>
			<textarea
				value={$page.data.listContent?.[0].strategic_goal}
				on:input={changeHandler}
				class="p-4 flex-grow w-full block resize-none focus:outline-none text-justify"
				placeholder="describe your large-level goals for this project..."
			/>
		</div>
		<div class="mt-2 flex-grow w-80">A summary of what you are currently doing.</div>
	</div>
	{#key $page.params.tasks}
		<slot />
	{/key}
</div>
