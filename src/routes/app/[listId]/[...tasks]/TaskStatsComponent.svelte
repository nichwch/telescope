<script lang="ts">
	import type { IntermediateTask } from '$lib/types';

	export let items: IntermediateTask[];

	let colorMap: Record<string, number> = {};
	let totalTaskLength = items.length;
	let finishedTaskLength = items.filter((item) => item.done).length;

	$: items.forEach((item) => {
		let color = item.color;
		if (!color) return;
		if (colorMap[color]) {
			colorMap[color]++;
		} else {
			colorMap[color] = 1;
		}
	});

	$: colorArray = Object.entries(colorMap).map(([color, count]) => ({ color, count }));
</script>

{finishedTaskLength} done / {totalTaskLength}
{#each colorArray as { color, count }}
	<div>{color} {count}</div>
{/each}
