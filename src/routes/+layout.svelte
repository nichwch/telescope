<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { themeStore } from './app/themeStore';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div
	class="min-h-screen flex flex-col"
	class:bg-white={$themeStore === null}
	class:bg-red-50={$themeStore === 'red'}
	class:bg-orange-50={$themeStore === 'orange'}
	class:bg-yellow-50={$themeStore === 'yellow'}
	class:bg-green-50={$themeStore === 'green'}
	class:bg-blue-50={$themeStore === 'blue'}
	class:bg-purple-100={$themeStore === 'purple'}
	class:bg-pink-50={$themeStore === 'pink'}
>
	<slot />
</div>
