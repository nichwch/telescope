import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { supabase } = locals;
	const { session } = await parent();
	if (!session?.user) {
		throw error(401, 'Unauthorized');
	}
	const { data: accountStatus } = await supabase
		.from('accounts')
		.select('*')
		.eq('user_id', session.user.id);
	return { accountStatus };
}) satisfies LayoutServerLoad;
