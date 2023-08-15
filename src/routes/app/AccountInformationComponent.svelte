<script lang="ts">
	import type { SubscriptionType } from '$lib/types';

	export let subscriptionType: SubscriptionType;
</script>

<div>current plan: {subscriptionType}</div>
{#if subscriptionType === 'free'}
	<div>upgrade</div>
{/if}
