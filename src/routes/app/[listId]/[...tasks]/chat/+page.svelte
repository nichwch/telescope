<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ChatCompletionRequestMessage } from 'openai';
	import { fade } from 'svelte/transition';
	import { submitChatMessage } from '../../../../../lib/fetchers.js';

	export let data;

	let currentMessage = '';
	let messages: ChatCompletionRequestMessage[] = [];

	const submitMessage = async () => {
		messages = [...messages, { role: 'user', content: currentMessage }];

		currentMessage = '';
		const model_response = await submitChatMessage(messages);
		messages = [...messages, model_response];
	};
</script>

<svelte:window
	on:keydown={(evt) => {
		if (evt.key === 'Escape') {
			goto('.');
		} else if (evt.key === 'Enter') {
			submitMessage();
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
		{#each messages as message}
			<div class="py-10">{message.content}</div>
		{/each}
	</div>
	<div
		class="absolute bottom-10 left-[10%] w-4/5 mx-auto flex border border-green-700 bg-green-100"
	>
		<input
			bind:value={currentMessage}
			class="flex-grow p-2 bg-transparent border-r border-r-green-700"
		/><button on:click={submitMessage} class="p-2 bg-green-100 hover:bg-green-200 transition-colors"
			>send</button
		>
	</div>
</dialog>
