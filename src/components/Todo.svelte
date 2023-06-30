<script lang="ts">
	import { page } from '$app/stores';
	import DoubleBarIcon from './Icons/DoubleBarIcon.svelte';
	import DragHandle from './Icons/DragHandle.svelte';
	import ExpandIcon from './Icons/ExpandIcon.svelte';

	export let item: any;
	export let focusedElement: string | undefined = undefined;
</script>

<div id={item.id} class="flex items-center pb-4">
	<!-- <DoubleBarIcon /> -->
	<DragHandle />
	<textarea
		class="h-6 resize-none whitespace-nowrap flex-grow px-4 focus:outline-none"
		placeholder="untitled task"
		bind:value={item.name}
	/>
	<a href={`${$page.url}/${item.id}`}>
		<ExpandIcon />
	</a>
</div>
