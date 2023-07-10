import type { TODO } from './types';

export const fetchAITaskSuggestions = async (
	strategic_goal: string,
	todo_list: TODO[],
	current_task: TODO
) => {
	console.log({ strategic_goal, todo_list, current_task });
	const res = await fetch('/api/suggest-tasks', {
		method: 'POST',
		body: JSON.stringify({
			strategic_goal,
			todo_list: todo_list,
			current_task: current_task
		})
	});
	const res_data = await res.json();
	console.log({ res_data });
	return res_data;
};
