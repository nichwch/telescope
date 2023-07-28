<script lang="ts">
	import TitleComponent from './TitleComponent.svelte';

	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	export let data;
	const { supabase } = data;
	let strategic_goal_input = $page.data.listContent?.[0].strategic_goal || '';
	let last_flushed_strategic_goal_input = strategic_goal_input;

	let name_input = $page.data.listContent?.[0].name || '';
	let last_flushed_name_input = name_input;

	let isFlushing = false;

	const updateInterval = setInterval(async () => {
		if (
			strategic_goal_input === last_flushed_strategic_goal_input &&
			name_input === last_flushed_name_input
		)
			return;
		if (isFlushing) return;
		isFlushing = true;
		await supabase
			.from('lists')
			.update({
				strategic_goal: strategic_goal_input,
				name: name_input,
				last_edited_date: new Date().toISOString()
			})
			.eq('id', $page.params.listId);
		isFlushing = false;
		last_flushed_strategic_goal_input = strategic_goal_input;
		last_flushed_name_input = name_input;
	}, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});

	const strategyChangeHandler = (
		e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }
	) => {
		strategic_goal_input = (e?.target as HTMLTextAreaElement)?.value || '';
	};

	const nameChangeHandler = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		name_input = (e?.target as HTMLInputElement)?.value || '';
	};
</script>

<!-- TODO show actual name, allow editing -->
<div
	class="w-full px-5 md:w-[50vw] lg:w-[40vw] md:pr-80 md:px-0 md:mx-auto pb-5 md:pb-20 md:box-content relative"
>
	{#key $page.params.tasks}
		<slot />
	{/key}
	<div
		class="hidden md:block fixed top-20 pt-2 md:ml-[50vw] lg:ml-[40vw] pl-6 w-80 pb-40 h-full box-border"
	>
		<div class="flex flex-col h-full" in:fade>
			<div class="flex-grow flex flex-col">
				<div class="py-1 text-gray-500 text-sm">project goal:</div>
				<textarea
					value={$page.data.listContent?.[0].strategic_goal || ''}
					on:input={strategyChangeHandler}
					class="flex-grow w-full block resize-none focus:outline-none"
					placeholder="describe your large-level goals for this project..."
				/>
			</div>
			<div class="mt-2 flex-grow w-80" />
		</div>
	</div>
</div>
