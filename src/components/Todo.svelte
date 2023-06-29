<script lang="ts">
	import { page } from '$app/stores';

	export let item: any;
	export let focusedElement: string | undefined = undefined;
</script>

<div id={item.id} class="flex">
	<div class="w-10 h-10 bg-slate-200 border border-black inline-block" />
	<textarea
		class="h-10 resize-none whitespace-nowrap flex-grow px-4 py-2"
		placeholder="untitled task"
		bind:value={item.name}
	/>
	<a href={`${$page.url}/${item.id}`}>expand</a>
</div>
