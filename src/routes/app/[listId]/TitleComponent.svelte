<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { themeStore } from '../themeStore';
	export let data;
	const { supabase } = data;
	let strategic_goal_input = $page.data.listContent?.[0].strategic_goal || '';
	let last_flushed_strategic_goal_input = strategic_goal_input;

	let name_input = $page.data.listContent?.[0].name || '';
	let last_flushed_name_input = name_input;

	let isFlushing = false;

	const updateInterval = setInterval(async () => {
		if (
			strategic_goal_input === last_flushed_strategic_goal_input &&
			name_input === last_flushed_name_input
		)
			return;
		if (isFlushing) return;
		isFlushing = true;
		supabase
			.from('lists')
			.update({
				strategic_goal: strategic_goal_input,
				name: name_input,
				last_edited_date: new Date().toISOString()
			})
			.eq('id', $page.params.listId)
			.then(() => {
				isFlushing = false;
				last_flushed_strategic_goal_input = strategic_goal_input;
				last_flushed_name_input = name_input;
			});
	}, 300);

	onDestroy(() => {
		clearInterval(updateInterval);
	});

	const nameChangeHandler = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		name_input = (e?.target as HTMLInputElement)?.value || '';
	};
</script>

<input
	value={$page.data.listContent?.[0].name || ''}
	on:input={nameChangeHandler}
	class="w-full mb-3 focus:outline-none"
	placeholder="untitled list"
	class:bg-white={$themeStore === null}
	class:bg-red-50={$themeStore === 'red'}
	class:bg-orange-50={$themeStore === 'orange'}
	class:bg-yellow-50={$themeStore === 'yellow'}
	class:bg-green-50={$themeStore === 'green'}
	class:bg-blue-50={$themeStore === 'blue'}
	class:bg-purple-100={$themeStore === 'purple'}
	class:bg-pink-50={$themeStore === 'pink'}
/>
