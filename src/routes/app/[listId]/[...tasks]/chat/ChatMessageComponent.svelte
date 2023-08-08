<script lang="ts">
	import type { Message } from 'ai';
	import 'highlight.js/styles/github.css';
	import MarkdownRenderer from './MarkdownASTRenderer.svelte';
	import { unified } from 'unified';
	import remarkParse from 'remark-parse';
	export let message: Message;
	const parser = unified().use(remarkParse);

	const tree = parser.parse(message.content);

	console.log(message.content, tree.children);
</script>

{#if message.role !== 'system'}
	<div class="py-4">
		{#if message.role == 'user'}
			<span class="font-bold">you: </span>
		{:else if message.role == 'assistant'}<span class="font-semibold">AI: </span>
		{/if}
		{#each tree.children as node}
			<MarkdownRenderer {node} />
		{/each}
	</div>
{/if}
