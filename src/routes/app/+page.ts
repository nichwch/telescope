// src/routes/profile/+page.ts
import { error } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	if (!session?.user) {
		throw error(401, 'Unauthorized');
	}
	const { data: lists } = await supabase.from('lists').select('*');
	return {
		user: session?.user,
		lists
	};
};
