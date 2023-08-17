<script lang="ts">
	import type { SubscriptionType } from '$lib/types';
	import { taskColors } from '../../lib';
	import { backgroundColorStore } from './backgroundColorStore';

	export let subscriptionType: SubscriptionType;
	$: if (subscriptionType === 'free') {
		$backgroundColorStore = null;
	}
</script>

<div>current plan: {subscriptionType}</div>
{#if subscriptionType === 'free'}
	<div>upgrade</div>
{/if}
{#if subscriptionType === 'pro' || subscriptionType === 'plus'}
	<label
		class:bg-red-200={$backgroundColorStore === 'red'}
		class:text-red-900={$backgroundColorStore === 'red'}
		class:bg-orange-200={$backgroundColorStore === 'orange'}
		class:text-orange-900={$backgroundColorStore === 'orange'}
		class:bg-yellow-200={$backgroundColorStore === 'yellow'}
		class:text-yellow-900={$backgroundColorStore === 'yellow'}
		class:bg-green-200={$backgroundColorStore === 'green'}
		class:text-green-900={$backgroundColorStore === 'green'}
		class:bg-blue-200={$backgroundColorStore === 'blue'}
		class:text-blue-900={$backgroundColorStore === 'blue'}
		class:bg-purple-200={$backgroundColorStore === 'purple'}
		class:text-purple-900={$backgroundColorStore === 'purple'}
		class:bg-pink-200={$backgroundColorStore === 'pink'}
		class:text-pink-900={$backgroundColorStore === 'pink'}
	>
		pick a background color:
		<select bind:value={$backgroundColorStore}>
			<option value={null}>none</option>
			{#each taskColors as color}
				<option value={color}>{color}</option>
			{/each}
		</select>
	</label>
{/if}
