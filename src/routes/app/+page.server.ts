import type { Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals }) => {
		const { supabase } = locals;
		const session = await locals.getSession();
		if (session?.user.id) {
			const res = await supabase.from('lists').insert({ owner: session.user.id });
			return { res };
		}
	}
} satisfies Actions;
