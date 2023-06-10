<script>
	export let data;
</script>

<div
	class="hidden absolute w-72 h-full left-0 top-0 bg-green-100 lg:flex flex-col border-r border-r-gray-500"
>
	<h1 class="p-4 text-2xl">
		lists
		<form method="POST">
			<input type="button" value= />
		</form>
	</h1>
	<ul class="p-4 overflow-y-auto">
		{#each data?.lists || [] as list}
			<li>{list.name}</li>
		{/each}
	</ul>
</div>
<div class="lg:ml-72 h-full">
	<slot />
</div>
<svelte:body class="bg-green-100" />
