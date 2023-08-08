<script lang="ts">
	import type { Message } from 'ai';
	import 'highlight.js/styles/github.css';
	import MarkdownRenderer from './MarkdownTokenRenderer.svelte';
	import { unified } from 'unified';
	import remarkParse from 'remark-parse';
	export let message: Message;
	const parser = unified().use(remarkParse);

	const tree = parser.parse(message.content);

	console.log(tree);
</script>

{#if message.role !== 'system'}
	<div class="py-4">
		{#if message.role == 'user'}
			<span class="font-bold">you: </span>
		{:else if message.role == 'assistant'}<span class="font-semibold">AI: </span>
		{/if}
	</div>
{/if}

<style>
	/* div.code {
		padding: 0.25rem;
		background-color: pink;
	} */
</style>
