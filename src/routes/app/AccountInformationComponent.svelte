<script lang="ts">
	import type { SubscriptionType } from '$lib/types';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { taskColors } from '../../lib';
	import { themeStore } from './themeStore';
	import { dev } from '$app/environment';

	export let supabase: SupabaseClient;
	export let user_id: string | undefined;
	export let subscriptionType: SubscriptionType;

	$: if (user_id) supabase.from('account_settings').upsert({ theme: $themeStore, user_id });
</script>

<div>current plan: {subscriptionType}</div>
{#if subscriptionType === 'free'}
	<div>upgrade</div>
{/if}
{#if subscriptionType === 'pro' || subscriptionType === 'plus'}
	<label
		class:bg-red-200={$themeStore === 'red'}
		class:text-red-900={$themeStore === 'red'}
		class:bg-orange-200={$themeStore === 'orange'}
		class:text-orange-900={$themeStore === 'orange'}
		class:bg-yellow-200={$themeStore === 'yellow'}
		class:text-yellow-900={$themeStore === 'yellow'}
		class:bg-green-200={$themeStore === 'green'}
		class:text-green-900={$themeStore === 'green'}
		class:bg-blue-200={$themeStore === 'blue'}
		class:text-blue-900={$themeStore === 'blue'}
		class:bg-purple-200={$themeStore === 'purple'}
		class:text-purple-900={$themeStore === 'purple'}
		class:bg-pink-200={$themeStore === 'pink'}
		class:text-pink-900={$themeStore === 'pink'}
	>
		pick a background color:
		<select bind:value={$themeStore}>
			<option value={null}>none</option>
			{#each taskColors as color}
				<option value={color}>{color}</option>
			{/each}
		</select>
	</label>
	<div>
		{#if dev}
			<a href="https://billing.stripe.com/p/login/test_4gw28M6JH0wk9Xi7ss">manage subscription</a>
		{:else}
			<a href="https://billing.stripe.com/p/login/5kA6pweSOb7t7gA9AA">manage subscription</a>
		{/if}
	</div>
{/if}
