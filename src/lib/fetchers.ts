import type { TODO } from './types';

export const fetchAITaskSuggestions = async (
	strategic_goal: string,
	focused_tasks: TODO[],
	current_task: TODO,
	task_prompt: string
) => {
	const res = await fetch('/api/suggest-tasks', {
		method: 'POST',
		body: JSON.stringify({
			strategic_goal,
			focused_tasks: focused_tasks,
			current_task: current_task,
			task_prompt: task_prompt
		})
	});
	return await res.json();
};
