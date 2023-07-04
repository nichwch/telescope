<script lang="ts">
	import { page } from '$app/stores';
	import type { TODO } from '../utils/types';
	import DragHandle from './Icons/DragHandle.svelte';
	import ExpandIcon from './Icons/ExpandIcon.svelte';

	export let item: TODO;
	export let focusedElement: string | undefined = undefined;
</script>

<div id={item.id} class="flex items-center pb-4 border-b border-b-gray-300 mb-3 bg-white">
	<DragHandle />
	<span
		contenteditable
		id="input {item.id}"
		role="textbox"
		class="textarea inline-block resize-none break-word overflow-x-hidden flex-grow px-4 focus:outline-none cursor-text"
		bind:innerText={item.name}
	>
		{item.name}
	</span>
	<div class="flex items-center">
		<a
			class:text-green-700={item.children.length > 0}
			class:font-semibold={item.children.length > 0}
			class:text-gray-500={item.children.length === 0}
			class="w-6 text-center"
			href={`${$page.url}/${item.id}`}
		>
			{#if item.children.length > 0}
				{item.children.length}
			{:else}
				+
			{/if}
		</a>
	</div>
</div>

<style>
	.textarea[contenteditable]:empty::before {
		content: 'untitled task';
		color: gray;
	}
</style>
