import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../DatabaseDefinitions';
import type { TODO } from './types';

export const getUpdateListFunction = (supabase: SupabaseClient<Database>) => {
	const func = async (items: TODO[], listId: string) => {
		console.log('updating...', items, listId);
		return await supabase
			.from('lists')
			.update({
				tasks_blob: items
			})
			.eq('id', listId);
	};
	return func;
};
