<script lang="ts">
	import type { Message } from 'ai';
	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';
	export let message: Message;

	const md = new MarkdownIt({
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				console.log('lang', lang);
				try {
					return hljs.highlight(str, { language: lang }).value;
				} catch (error) {
					console.error({ error });
				}
			}

			return ''; // use external default escaping
		}
	});

	$: htmlContent = md.render(message.content);
	$: console.log('tokens', md.parse(message.content, {}));
</script>

{#if message.role !== 'system'}
	<div class="py-4">
		{#if message.role == 'user'}
			<span class="font-bold">you: </span>
		{:else if message.role == 'assistant'}<span class="font-semibold">AI: </span>
		{/if}
		{@html htmlContent}
	</div>
{/if}

<style>
	/* div.code {
		padding: 0.25rem;
		background-color: pink;
	} */
</style>
