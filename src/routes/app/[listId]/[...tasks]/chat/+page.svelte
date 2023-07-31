<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { useChat, type Message } from 'ai/svelte';
	import ChatMessageComponent from './ChatMessageComponent.svelte';

	export let data;

	const { input, handleSubmit, messages } = useChat({
		api: '/api/chat',
		initialMessages: (data.currentTask?.chats as any as Message[]) || [
			// a default system message to give context
			{
				role: 'system',
				content: `The user is asking for help about the following task:
======
name: ${data.currentTask?.name}
description: ${data.currentTask?.description}
======

Do your best to help them!`
			}
		],
		body: {
			task_id: data.currentTask?.id
		}
	});
</script>

<svelte:window
	on:keydown={(evt) => {
		if (evt.key === 'Escape') {
			goto('.');
		} else if (evt.key === 'Enter') {
			handleSubmit(evt);
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
	border border-green-700 bg-green-50 text-green-800 p-0
"
>
	<div class="block h-full px-[10%] pt-10 overflow-y-scroll pb-20">
		{#each $messages as message}
			<ChatMessageComponent {message} />
		{/each}
	</div>
	<div
		class="absolute bottom-10 left-[10%] w-4/5 mx-auto flex border border-green-700 bg-green-100"
	>
		<input
			bind:value={$input}
			class="flex-grow p-2 bg-transparent border-r border-r-green-700"
		/><button on:click={handleSubmit} class="p-2 bg-green-100 hover:bg-green-200 transition-colors"
			>send</button
		>
	</div>
</dialog>
