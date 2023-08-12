<script lang="ts">
	import { goto } from '$app/navigation';
	import { useChat, type Message } from 'ai/svelte';
	import ChatMessageComponent from './ChatMessageComponent.svelte';
	import { getRoleAndGoalContext, getTaskContext } from '$lib/getTaskContext';
	import { tick } from 'svelte';
	import { itemStore } from '../itemStore';
	import { page } from '$app/stores';
	import type { Task } from '../../../../../lib/types';
	import { currentTaskStore } from '../currentTaskStore';

	export let existingMessages: any[] = [];
	export let title = '';
	export let strategic_goal: string = '';
	const taskContext = getTaskContext(
		$currentTaskStore,
		$itemStore?.filter((item: any) => !item.done) || [],
		$itemStore.items?.filter((item: any) => item.done) || []
	);
	const roleAndGoalContext = getRoleAndGoalContext(strategic_goal, title);

	let element: HTMLElement;
	let loadingMessage = false;

	const submitMessage = (evt: any) => {
		if (loadingMessage) return;
		loadingMessage = true;
		handleSubmit(evt);
		tick();
		element.scroll({ top: element.scrollHeight, behavior: 'instant' });
	};

	const initialMessages = [
		{
			role: 'system',
			content: `${roleAndGoalContext}
${taskContext}
Note that context may have changed since previous messages, so don't apologize for discrepancies.`,
			id: 'context'
		},
		...existingMessages
	];

	$: console.log({ roleAndGoalContext, CT: $currentTaskStore, taskContext, initialMessages });

	const { input, handleSubmit, messages } = useChat({
		api: '/api/chat',
		//TODO: need to find way to dynamically modify this, without remounting component!
		initialMessages,
		body: {
			task_id: $page.params.tasks[$page.params.tasks.length - 1],
			list_id: $page.params.listId,
			strategic_goal: strategic_goal,
			focused_tasks: $itemStore,
			current_task: $currentTaskStore,
			title
		},
		onFinish: () => (loadingMessage = false)
	});

	const scrollToBottom = async () => {
		if (!element) return;
		element.scroll({ top: element.scrollHeight, behavior: 'smooth' });
	};

	$: length = $messages.length;
	$: if (length && element) {
		scrollToBottom();
	}
</script>

<svelte:window
	on:keydown={(evt) => {
		if (evt.key === 'Escape') {
			goto('.');
		} else if (evt.key === 'Enter') {
			submitMessage(evt);
		}
	}}
/>

<div class="h-full flex flex-col">
	<div
		class="h-full overflow-y-scroll pb-20 text-green-800 flex flex-col-reverse"
		bind:this={element}
	>
		<div>
			{#each $messages as message}
				{#key message.content}
					<ChatMessageComponent {message} />
				{/key}
			{/each}
		</div>
	</div>
	<div class=" w-4/5 mx-auto flex border border-green-700 bg-green-100">
		<input
			bind:value={$input}
			class="flex-grow p-2 bg-transparent border-r border-r-green-700"
		/><button on:click={submitMessage} class="p-2 bg-green-100 hover:bg-green-200 transition-colors"
			>send</button
		>
	</div>
</div>
