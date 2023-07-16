<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { TODO } from '$lib/types';

	export let focusedTask: TODO;
	const {
		params: { listId }
	} = $page;

	$: history = $page.params.tasks;
	$: segments = history?.split('/');
</script>

<div class="border border-green-700 bg-green-100 text-green-800" in:fly>
	<div class="px-2 py-0.5">
		<a
			href="/app/{listId}/{segments.slice(0, segments.length - 1).join('/')}"
			class="text-sm opacity-80 underline"
		>
			back
		</a>
		<div
			contenteditable
			role="textbox"
			class="block name_textarea resize-none break-word overflow-x-hidden flex-grow px-4 focus:outline-none cursor-text"
			bind:innerText={focusedTask.name}
		>
			<!-- {focusedTask.name} -->
		</div>
		<div
			contenteditable
			role="textbox"
			class="block description_textarea resize-none
	break-word overflow-x-hidden flex-grow px-4 focus:outline-none cursor-text"
			bind:innerText={focusedTask.description}
		>
			<!-- {focusedTask.description} -->
		</div>
	</div>
</div>

<style>
	.name_textarea[contenteditable]:empty::before {
		content: 'untitled task';
		color: inherit;
		opacity: 50%;
	}

	.description_textarea[contenteditable]:empty::before {
		content: 'add a description...';
		color: inherit;
		opacity: 50%;
	}
</style>
