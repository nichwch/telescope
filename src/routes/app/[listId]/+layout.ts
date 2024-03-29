import { error } from '@sveltejs/kit';

export const load = async ({ params, parent }) => {
	const { supabase, session } = await parent();
	if (!session?.user) {
		throw error(401, 'Unauthorized');
	}
	const listId = params.listId;
	const { data: listContent } = await supabase.from('lists').select('*').eq('id', listId);
	if (!listContent) {
		throw error(404, 'Not found');
	}
	return {
		listContent
	};
};
