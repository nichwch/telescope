<script>
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		goto('/');
	};
</script>

<div class="max-w-4xl mx-5 lg:mx-auto py-5 md:py-20 flex flex-col h-full">
	<div class="w-full mb-3 text-sm text-gray-500">all lists</div>
	<div class="flex h-full" in:fade>
		<div class="flex-grow">
			<form method="POST" action="/app" class="py-1 text-sm text-green-700">
				<input type="submit" value="create new list" class="h-5 hover:underline" />
			</form>
			<ul class="overflow-y-auto">
				{#each data?.lists || [] as list}
					<a class="block hover:underline" href="/app/{list.id}">{list.name || 'untitled'}</a>
				{/each}
			</ul>
		</div>
		<div class="hidden md:flex flex-col h-full ml-6">
			<div class="py-1 text-sm">
				<h1 class="text-gray-500 h-5">settings</h1>
			</div>
			<button class="hover:underline block" on:click={handleSignOut}>sign out</button>
		</div>
	</div>
</div>
