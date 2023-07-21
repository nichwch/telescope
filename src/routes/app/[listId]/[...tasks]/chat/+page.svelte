<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	let show = true;
</script>

<svelte:window
	on:keydown={(evt) => {
		if (evt.key === 'Escape') {
			goto('.');
		}
	}}
/>
<a
	href="."
	class="fixed cursor-default block top-0 left-0 w-screen h-screen bg-gray-500 opacity-50 z-50"
>
	<p class="hidden">go back</p>
</a>
<dialog class="fixed top-0 left-0 w-1/2 h-2/3 bg-color-white">Big Chungus</dialog>
