<script lang="ts">
	import { goto } from '$app/navigation';
	import { useChat, type Message } from 'ai/svelte';
	import ChatMessageComponent from './ChatMessageComponent.svelte';
	import { tick } from 'svelte';
	import { itemStore } from '../itemStore';
	import { page } from '$app/stores';
	import { currentTaskStore } from '../currentTaskStore';

	export let existingMessages: any[] = [];
	export let title = '';
	export let strategic_goal: string = '';

	let element: HTMLElement;
	let loadingMessage = false;

	const submitMessage = (evt: any) => {
		if (loadingMessage) return;
		loadingMessage = true;
		let segments = $page.params.tasks?.split('/');
		handleSubmit(evt, {
			options: {
				body: {
					task_id: segments?.[segments.length - 1],
					list_id: $page.params.listId,
					strategic_goal: strategic_goal,
					focused_tasks: $itemStore,
					current_task: $currentTaskStore,
					title
				}
			}
		});
		tick();
		element.scroll({ top: element.scrollHeight, behavior: 'instant' });
	};

	let segments = $page.params.tasks?.split('/');
	const { input, handleSubmit, messages, setMessages } = useChat({
		api: '/api/chat',
		//TODO: need to find way to dynamically modify this, without remounting component!
		initialMessages: existingMessages,
		body: {
			task_id: segments?.[segments.length - 1],
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

	const scrollHandler = (evt: Event) => {
		scrollY = (evt?.target as Element)?.scrollTop || 0;
	};

	let scrollY = 0;
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
	<div>
		<h2 class="text-gray-500 inline-block">assistant</h2>
		{#if $messages.length > 0}
			<button
				class="text-red-800 opacity-75 float-right"
				on:click={() => {
					if (window.confirm('Are you sure? This cannot be undone')) setMessages([]);
				}}>clear messages</button
			>
		{/if}
	</div>
	<div
		class="h-full overflow-y-scroll pb-20 text-green-800 flex transition-all border-t border-t-gray-300"
		bind:this={element}
		on:scroll={scrollHandler}
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
