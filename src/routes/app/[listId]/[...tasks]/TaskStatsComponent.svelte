<script lang="ts">
	import type { IntermediateTask } from '$lib/types';

	export let items: IntermediateTask[];
	export let userIsPremium: boolean;

	let colorMap: Record<string, number> = {};
	let totalTaskLength = items.length;
	let finishedTaskLength = items.filter((item) => item.done).length;

	$: {
		colorMap = {};
		items.forEach((item) => {
			let color = item.color;
			if (!color) return;
			if (colorMap[color]) {
				colorMap[color]++;
			} else {
				colorMap[color] = 1;
			}
		});
	}

	$: colorArray = Object.entries(colorMap).map(([color, count]) => ({ color, count }));
</script>

{finishedTaskLength} done / {totalTaskLength}
{#if userIsPremium}
	{#each colorArray as { color, count }}
		<div
			class="inline-block px-0.5 w-4 ml-2 text-center"
			class:bg-red-200={color === 'red'}
			class:text-red-900={color === 'red'}
			class:bg-orange-200={color === 'orange'}
			class:text-orange-900={color === 'orange'}
			class:bg-yellow-200={color === 'yellow'}
			class:text-yellow-900={color === 'yellow'}
			class:bg-green-200={color === 'green'}
			class:text-green-900={color === 'green'}
			class:bg-blue-200={color === 'blue'}
			class:text-blue-900={color === 'blue'}
			class:bg-purple-200={color === 'purple'}
			class:text-purple-900={color === 'purple'}
			class:bg-pink-200={color === 'pink'}
			class:text-pink-900={color === 'pink'}
		>
			{count}
		</div>
	{/each}
{/if}
