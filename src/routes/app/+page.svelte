<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import TrashIcon from '../../components/Icons/TrashIcon.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let hoveredList: string | null = null;

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
			{#if data?.lists && data.lists.length > 0}
				<ul class="overflow-y-auto">
					{#each data?.lists || [] as list}
						<div
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
								<span class="ml-3 text-gray-500"> {list.tasks_blob?.length}</span>
							</div>
						</div>
					{/each}
				</ul>
			{:else}
				<div>No todo lists yet. Create one by clicking the button above.</div>
			{/if}
		</div>
		<div class="hidden md:flex flex-col h-full ml-6 w-80">
			<div class="py-1 text-sm">
				<h1 class="text-gray-500 h-5">settings</h1>
			</div>
			<button class="hover:underline block text-left" on:click={handleSignOut}>sign out</button>
		</div>
	</div>
</div>
