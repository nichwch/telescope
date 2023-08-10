<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { useChat, type Message } from 'ai/svelte';
	import ChatMessageComponent from './ChatMessageComponent.svelte';
	import { lastEditedStore } from './updateDateStores';
	import { getRoleAndGoalContext, getTaskContext } from '$lib/getTaskContext';
	import { tick } from 'svelte';

	export let data;

	const taskContext = getTaskContext(
		data.currentTask,
		data.items?.filter((item: any) => !item.done) || [],
		data.items?.filter((item: any) => item.done) || []
	);
	const roleAndGoalContext = getRoleAndGoalContext(
		data.listContent?.[0]?.strategic_goal,
		data.listContent?.[0]?.name
	);

	const existingMessages = (data.currentTask?.chats as any as Message[]) || [];
	let element: HTMLElement;
	let loadingMessage = false;

	const submitMessage = (evt: any) => {
		if (loadingMessage) return;
		loadingMessage = true;
		handleSubmit(evt);
		tick();
		element.scroll({ top: element.scrollHeight, behavior: 'instant' });
	};

	const { input, handleSubmit, messages } = useChat({
		api: '/api/chat',
		initialMessages: [
			{
				role: 'system',
				content: roleAndGoalContext,
				id: 'roleAndGoalContext'
			},
			...existingMessages,

			{
				role: 'system',
				content: taskContext,
				id: 'taskContext'
			},
			{
				role: 'system',
				content:
					"Note that context may have changed since previous messages, so don't apologize for discrepancies.",
				id: 'disclaimer'
			}
		],
		body: {
			task_id: data.currentTask?.id,
			strategic_goal: data.listContent?.[0]?.strategic_goal,
			focused_tasks: data.items,
			current_task: data.currentTask,
			title: data.listContent?.[0]?.name
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
