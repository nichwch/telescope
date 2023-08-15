<script lang="ts">
	export let status: 'free' | 'plus' | 'pro';
</script>

<div>current plan: {status}</div>
{#if status === 'free'}
	<div>upgrade</div>
{/if}
