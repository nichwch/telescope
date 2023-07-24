import { error } from '@sveltejs/kit';
import type { TaskWithChildren } from '../../../../lib/types.js';

export const load = async ({ params, parent }) => {
	const { supabase, session } = await parent();
	if (!session?.user) {
		throw error(401, 'Unauthorized');
	}
	const { tasks, listId } = params;
	const taskArray = tasks?.split('/').filter((str) => str.length > 0) || [];
	const currentTaskID = taskArray[taskArray.length - 1];
	let items = [];
	let currentTask = null;
	if (currentTaskID) {
		items = ((await supabase.from('tasks').select('*, tasks (id)').eq('task_parent', currentTaskID))
			?.data || []) as TaskWithChildren[];
		currentTask =
			(await supabase.from('tasks').select('*').eq('id', currentTaskID))?.data?.[0] || null;
	} else {
		items = ((await supabase.from('tasks').select('*, tasks (id)').eq('list_parent', listId))
			?.data || []) as TaskWithChildren[];
	}
	console.log(items);
	return {
		items,
		currentTask
	};
};
