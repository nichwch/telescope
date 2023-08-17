<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { backgroundColorStore } from './app/backgroundColorStore';

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
	class:bg-white={$backgroundColorStore === null}
	class:bg-red-50={$backgroundColorStore === 'red'}
	class:bg-orange-50={$backgroundColorStore === 'orange'}
	class:bg-yellow-50={$backgroundColorStore === 'yellow'}
	class:bg-green-50={$backgroundColorStore === 'green'}
	class:bg-blue-50={$backgroundColorStore === 'blue'}
	class:bg-purple-100={$backgroundColorStore === 'purple'}
	class:bg-pink-50={$backgroundColorStore === 'pink'}
>
	<slot />
</div>
