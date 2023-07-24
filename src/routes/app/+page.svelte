<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { flip } from 'svelte/animate';
	import { FLIP_DURATION_MS } from '../../lib/index.js';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let hoveredList: string | null = null;

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		goto('/');
	};

	let scrollY = 0;
</script>

<!-- <div class="max-w-4xl mx-5 lg:mx-auto py-5 md:py-20 flex flex-col h-full" /> -->
<svelte:window bind:scrollY />
<div
	class="w-full px-5 md:w-[50vw] lg:w-[40vw] md:pr-80 md:mx-auto md:px-0 pb-5 md:pb-20 md:box-content"
>
	<div
		class:border-b={scrollY > 75}
		class:border-b-gray-300={scrollY > 75}
		class="sticky top-0 bg-white mt-5 md:mt-20 pt-2 transition-all"
	>
		<div class=" text-sm text-gray-500">all lists</div>
		<form method="POST" action="/app" class="py-1 text-sm text-green-700" use:enhance>
			<input type="submit" value="create new list" class="h-5 hover:underline cursor-pointer" />
		</form>
	</div>

	<div class="min-h-full" in:fade>
		{#if data?.lists && data.lists.length > 0}
			<ul class="overflow-y-auto">
				{#each data?.lists || [] as list (list.id)}
					<div
						animate:flip={{ duration: FLIP_DURATION_MS }}
						class="flex items-center border-b border-b-gray-200 hover:bg-gray-50 py-1"
						on:mouseover={() => (hoveredList = list.id)}
						on:mouseleave={() => (hoveredList = null)}
						on:focus={() => (hoveredList = list.id)}
					>
						<a class="block hover:underline" href="/app/{list.id}">{list.name || 'untitled'}</a>
						<div class="ml-auto flex items-center">
							{#if hoveredList === list.id}
								<button
									class="text-red-800 hover:underline opacity-70"
									on:click={async () => {
										const confirm = window.confirm(
											`Are you sure you want to delete ${
												list.name || 'untitled'
											}? This cannot be undone`
										);
										if (confirm) {
											await supabase.from('lists').delete().eq('id', list.id);
											invalidateAll();
										}
									}}>delete</button
								>
							{/if}
							<span class="ml-3 text-gray-500"> {list.tasks.length}</span>
						</div>
					</div>
				{/each}
			</ul>
		{:else}
			<div>No todo lists yet. Create one by clicking the button above.</div>
		{/if}
	</div>

	<div
		class="hidden md:block fixed top-20 pt-2 md:ml-[50vw] lg:ml-[40vw] pl-6 w-80 pb-40 h-full box-border"
	>
		<div class="hidden fixed md:flex flex-col h-full ml-6 w-80">
			<div class="py-1 text-sm">
				<h1 class="text-gray-500 h-5">settings</h1>
			</div>
			<button class="hover:underline block text-left" on:click={handleSignOut}>sign out</button>
		</div>
	</div>
</div>
