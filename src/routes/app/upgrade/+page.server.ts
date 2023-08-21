import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { accountStatus } = await parent();
	const subscription = accountStatus?.[0]?.subscription || 'free';
	console.log({ subscription });
	if (subscription !== 'free') {
		throw redirect(303, '/app');
	}
	return {};
}) satisfies PageServerLoad;
