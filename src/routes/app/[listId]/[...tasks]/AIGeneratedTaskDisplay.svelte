<script lang="ts">
	export let generatedTasks: string[];
</script>

<div>
	{#each generatedTasks as task}
		<div>{task}</div>
	{/each}
</div>
