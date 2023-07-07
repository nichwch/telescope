<script>
	import { fade } from 'svelte/transition';
	import LoadingSpinner from '../../../../components/Icons/LoadingSpinner.svelte';
</script>

<div class="text-orange-700 flex items-center" in:fade>
	<LoadingSpinner /> <span class="ml-3">loading...</span>
</div>
