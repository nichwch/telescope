<script lang="ts">
	import { page } from '$app/stores';

	export let item: any;
	export let focusedElement: string | undefined = undefined;
</script>

<div
	id={item.id}
	class:border={focusedElement === item.id}
	class:border-gray-500={focusedElement === item.id}
	class:border-b={focusedElement !== item.id}
	class:border-b-gray-500={focusedElement !== item.id}
	class="flex"
>
	<div class="w-10 h-10 bg-slate-200 inline-block border-r border-r-gray-500" />
	<textarea
		class="h-10 resize-none whitespace-nowrap flex-grow px-4 py-2"
		placeholder="untitled task"
		bind:value={item.name}
	/>
	<a href={`${$page.url}/${item.id}`}>expand</a>
</div>
