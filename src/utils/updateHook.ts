import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../DatabaseDefinitions';
import type { TODO } from './types';

export const getUpdateListFunction = (supabase: SupabaseClient<Database>) => {
	const func = async (items: TODO[], listId: string) => {
		return await supabase
			.from('lists')
			.update({
				tasks_blob: items
			})
			.eq('id', listId);
	};
	return func;
};
