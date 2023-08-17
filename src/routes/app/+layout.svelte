<script lang="ts">
	import type { SubscriptionType } from '$lib/types.js';
	import { themeStore } from './themeStore.js';

	export let data;

	let subscriptionType = (data.accountStatus?.[0]?.subscription as SubscriptionType) || 'free';

	if (subscriptionType === 'free') themeStore.set(null);
	else themeStore.set(data.accountSettings?.[0]?.theme || null);
</script>

<slot />
