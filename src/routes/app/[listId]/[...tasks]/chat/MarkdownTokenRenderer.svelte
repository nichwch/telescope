<script lang="ts">
	export let tag = 'div';
	export let content = '';
	console.log({
		tag,
		content
	});
</script>

<svelte:element this={tag}> {content}</svelte:element>
