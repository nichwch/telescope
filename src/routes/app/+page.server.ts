export const actions = {
	default: async ({ locals, params }) => {
		const { supabase } = locals;
		const session = await locals.getSession();
		if (session?.user.id) {
			console.log('session', session?.user.id);
			let res = await supabase.from('lists').insert({ owner: session.user.id });
			console.log('RES', res);
		}
	}
};
