<script lang="ts">
	import type { Code } from 'mdast';
	export let node: Code;
	import hljs from 'highlight.js';
	let highlightedCode = node.value;
	let copied = false;
	if (node.lang && hljs.getLanguage(node.lang)) {
		highlightedCode = hljs.highlight(node.value, { language: node.lang! }).value;
	}
	$: if (copied) {
		setTimeout(() => {
			copied = false;
		}, 1000);
	}
</script>

<div class="flex flex-col bg-green-200 bg-opacity-50 border border-green-700">
	<div class="flex bg-green-300 border-b border-b-green-700 p-2">
		<span>{node.lang}</span>
		<button
			class="ml-auto hover:text-green-600"
			on:click={() => {
				navigator.clipboard.writeText(node.value).then(() => {
					copied = true;
				});
			}}
		>
			{#if copied}
				copied!
			{:else}
				copy code
			{/if}
		</button>
	</div>
	<pre class="p-4">
<code class="whitespace-break-spaces">{@html highlightedCode}</code>
</pre>
</div>
