<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	$: if (data.session) {
		goto('app');
	}

	let email: string;
	let password: string;
	let error: string | null = null;

	const handleSignUp = async () => {
		const res = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${location.origin}/auth/callback`
			}
		});
		if (res.error) error = res.error.message;
		else goto('/signup/email-link');
	};
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Enter') {
			handleSignUp();
		}
	}}
/>
<div class="md:mt-20 mt-10 mx-5 md:w-72 md:mx-auto md:border md:border-black md:p-4 md:pt-10">
	<h1 class="text-xl mb-3">create a new account</h1>
	<input
		class="block border-b border-b-black mb-3 w-full focus:outline-none focus:bg-gray-200"
		name="email"
		placeholder="email"
		bind:value={email}
	/>
	<input
		class="block border-b border-b-black mb-3 w-full focus:outline-none focus:bg-gray-200"
		type="password"
		name="password"
		placeholder="password"
		bind:value={password}
	/>
	{#if error}
		<div class="text-red-500">{error}</div>
	{/if}
	<button class="block hover:underline mt-12" on:click={handleSignUp}>sign up</button>
	<a class="block mt-3 hover:underline" href="/signin">already have an account? sign in here</a>
</div>
