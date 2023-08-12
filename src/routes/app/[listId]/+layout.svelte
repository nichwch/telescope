<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import ChatAssistantComponent from './[...tasks]/chat/ChatAssistantComponent.svelte';
	import type { Message } from 'ai';
	import { currentTaskStore } from './[...tasks]/currentTaskStore';
	export let data;
	const { supabase } = data;
	let strategic_goal_input = $page.data.listContent?.[0].strategic_goal || '';
	let last_flushed_strategic_goal_input = strategic_goal_input;

	let isFlushing = false;

	$: list_chats = data.listContent?.[0].chats as any as Message[];
	$: focused_task_chats = $currentTaskStore?.chats as any as Message[];
	$: current_chats =
		$page.params.tasks && $page.params.tasks.length > 0 ? focused_task_chats : list_chats;

	const updateInterval = setInterval(async () => {
		if (strategic_goal_input === last_flushed_strategic_goal_input) return;
		if (isFlushing) return;
		isFlushing = true;
		await supabase
			.from('lists')
			.update({
				strategic_goal: strategic_goal_input,
				last_edited_date: new Date().toISOString()
			})
			.eq('id', $page.params.listId);
		isFlushing = false;
		last_flushed_strategic_goal_input = strategic_goal_input;
	}, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});

	const strategyChangeHandler = (
		e: Event & { currentTarget: EventTarget & HTMLTextAreaElement }
	) => {
		strategic_goal_input = (e?.target as HTMLTextAreaElement)?.value || '';
	};
</script>

<div
	transition:fade
	class=" w-full px-5 md:w-[50vw] lg:w-[40vw] md:pr-80 md:px-0 md:mx-auto pb-5 md:pb-20 md:box-content relative"
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
			<div class="mt-2 h-full flex-grow w-80">
				{#key $page.params.tasks}
					<ChatAssistantComponent
						existingMessages={current_chats || []}
						title={data.listContent?.[0].name || ''}
						strategic_goal={strategic_goal_input}
					/>
				{/key}
			</div>
		</div>
	</div>
</div>
