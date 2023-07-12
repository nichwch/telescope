import type { TODO } from './types';

export const fetchAITaskSuggestions = async (
	strategic_goal: string,
	todo_list: TODO[],
	current_task: TODO
) => {
	const res = await fetch('/api/suggest-tasks', {
		method: 'POST',
		body: JSON.stringify({
			strategic_goal,
			todo_list: todo_list,
			current_task: current_task
		})
	});
	return await res.json();
};
