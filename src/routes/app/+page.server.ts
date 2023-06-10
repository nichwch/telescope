export const actions = {
	default: async ({ locals, params }) => {
		const { supabase } = locals;
		const session = await locals.getSession();
		if (session?.user.id) {
			supabase.from('lists').insert({ owner: session.user.id });
		}
	}
};
