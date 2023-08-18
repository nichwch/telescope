<script lang="ts">
	import { dev } from '$app/environment';

	export let data;
	const user_id = data.session?.user.id;
</script>

<div>
	<h1>Plans:</h1>

	<script async src="https://js.stripe.com/v3/buy-button.js">
	</script>

	{#if dev}
		<h2>test upgrade button</h2>
		<stripe-buy-button
			client-reference-id={user_id}
			buy-button-id="buy_btn_1NgZ1eIApHiFZdHmFBsLPT6V"
			publishable-key="pk_test_8Nfce6efMabb1MxsyetTZJKU00Kx9UcrBW"
		/>
	{:else}
		<h2>telescope plus</h2>

		<stripe-buy-button
			client-reference-id={user_id}
			buy-button-id="buy_btn_1NfWujIApHiFZdHmcB0BKvjd"
			publishable-key="pk_live_x59sk9NbsFSdx9sqMI6uRyyb00SRK8BbrZ"
		/>
		<h2>telescope pro</h2>

		<stripe-buy-button
			client-reference-id={user_id}
			buy-button-id="buy_btn_1NfWv2IApHiFZdHmKWM7NNIz"
			publishable-key="pk_live_x59sk9NbsFSdx9sqMI6uRyyb00SRK8BbrZ"
		/>
	{/if}
</div>
