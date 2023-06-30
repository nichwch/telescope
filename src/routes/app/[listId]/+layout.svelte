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

<div class="max-w-4xl mx-auto py-20 flex flex-col h-full">
	<!-- TODO show actual name, allow editing -->
	<div class="w-full mb-3">list title</div>
	<div class="flex h-full" transition:fade>
		{#key $page.params.tasks}
			<slot />
		{/key}
		<div class="hidden md:flex flex-col h-full ml-6">
			<div class="mb-2 flex-grow w-80 flex flex-col">
				<div class="py-1 text-gray-500 text-sm">strategic goal:</div>
				<textarea
					value={$page.data.listContent?.[0].strategic_goal}
					on:input={changeHandler}
					class="flex-grow w-full block resize-none focus:outline-none"
					placeholder="describe your large-level goals for this project..."
				/>
			</div>
			<div class="mt-2 flex-grow w-80">A summary of what you are currently doing.</div>
		</div>
	</div>
</div>
