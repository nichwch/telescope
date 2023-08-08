<script lang="ts">
	import type { Code } from 'mdast';
	export let node: Code;
	import hljs from 'highlight.js';
	let highlightedCode = node.value;
	if (node.lang && hljs.getLanguage(node.lang)) {
		highlightedCode = hljs.highlight(node.value, { language: node.lang! }).value;
	}
</script>

<pre class="bg-green-200 bg-opacity-50 border border-green-700 p-4">
<code class="block text-left">{@html highlightedCode}</code>
</pre>
