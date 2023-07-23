import { error } from '@sveltejs/kit';

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
		items = (await supabase.from('tasks').select('*').eq('task_parent', currentTaskID))?.data || [];
		currentTask =
			(await supabase.from('tasks').select('*').eq('id', currentTaskID))?.data?.[0] || null;
	} else {
		items = (await supabase.from('tasks').select('*').eq('list_parent', listId))?.data || [];
	}
	return {
		items,
		currentTask
	};
};
