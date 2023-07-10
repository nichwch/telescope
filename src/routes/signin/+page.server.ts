import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const session = await locals.getSession();
	if (session?.user.id) {
		throw redirect(300, '/app');
	}
	return {};
}) satisfies PageServerLoad;
