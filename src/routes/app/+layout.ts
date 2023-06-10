// src/routes/profile/+page.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { supabase, session } = await parent();
	const { data: lists } = await supabase.from('lists').select('*');
	return {
		user: session?.user,
		lists
	};
};
