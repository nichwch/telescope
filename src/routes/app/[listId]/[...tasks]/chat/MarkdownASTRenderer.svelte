<script lang="ts">
	import type { Content } from 'mdast';
	import CodeRenderer from './CodeRenderer.svelte';
	export let node: Content;

	const depth = 'depth' in node ? node.depth : null;
	const ordered = 'ordered' in node ? node.ordered : null;

	const tagMap = {
		paragraph: 'p',
		heading: `h${depth}`,

		thematicBreak: 'hr',
		blockquote: 'blockquote',
		list: ordered ? 'oi' : 'ul',
		listItem: 'li',
		table: 'table',
		tableRow: 'tr',
		tableCell: 'td',
		code: 'code',
		emphasis: 'em',
		strong: 'strong',
		break: 'br',
		text: 'span',
		delete: 'strike',
		// following not supported, included just for type safety
		html: 'html',
		yaml: 'div',
		definition: 'div',
		footnoteDefinition: 'div',
		textDirective: 'div',
		link: 'a',
		linkReference: 'a',
		inlineCode: 'code',
		image: 'img',
		imageReference: 'img',
		footnote: 'div',
		footnoteReference: 'div'
	};
	const tag: string = (node.type in tagMap && tagMap[node.type]!) || 'span';
	console.log({ node });
</script>

{#if node.type === 'code'}
	<CodeRenderer {node} />
{:else}
	<svelte:element this={tag}>
		{#if 'value' in node}
			{node.value}
		{/if}
		{#if 'children' in node}
			{#each node.children as child}
				<svelte:self node={child} />
			{/each}
		{/if}
	</svelte:element>
{/if}

<style>
	:global(li > p) {
		display: inline;
	}

	p,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
</style>
