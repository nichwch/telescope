<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { useChat, type Message } from 'ai/svelte';
	import ChatMessageComponent from './ChatMessageComponent.svelte';
	import { lastEditedStore } from './updateDateStores';
	import { getRoleAndGoalContext, getTaskContext } from '$lib/getTaskContext';

	export let data;

	const taskContext = getTaskContext(
		data.currentTask,
		data.items.filter((item) => !item.done),
		data.items.filter((item) => item.done)
	);
	const roleAndGoalContext = getRoleAndGoalContext(
		data.listContent?.[0]?.strategic_goal,
		data.listContent?.[0]?.name
	);

	const existingMessages = (data.currentTask?.chats as any as Message[]) || [];
	let loadingMessage = false;

	const submitMessage = (evt: any) => {
		if (loadingMessage) return;
		loadingMessage = true;
		handleSubmit(evt);
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

<a
	in:fade
	href="."
	class="fixed cursor-default block top-0 left-0 w-screen h-screen bg-gray-500 opacity-50 z-40"
>
	<p class="hidden">go back</p>
</a>
<dialog
	in:fade
	class="fixed block top-[8.333%] left-0 w-2/3 h-5/6 z-50
	border border-green-700 bg-green-50 p-0
"
>
	<div
		class="h-full px-[10%] pt-10 overflow-y-scroll pb-20 text-green-800 flex flex-col-reverse"
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
	<div
		class="absolute bottom-10 left-[10%] w-4/5 mx-auto flex border border-green-700 bg-green-100"
	>
		<input
			bind:value={$input}
			class="flex-grow p-2 bg-transparent border-r border-r-green-700"
		/><button on:click={submitMessage} class="p-2 bg-green-100 hover:bg-green-200 transition-colors"
			>send</button
		>
	</div>
</dialog>
