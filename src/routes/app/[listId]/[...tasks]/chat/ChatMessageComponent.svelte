<script lang="ts">
	import { type Message } from 'ai';
	export let message: Message;
</script>

{#if message.role !== 'system'}
	<div class="py-4">
		{#if message.role == 'user'}
			<span class="font-bold">you: </span>
		{:else if message.role == 'assistant'}<span class="font-semibold">AI: </span>
		{/if}
		{message.content}
	</div>
{/if}
