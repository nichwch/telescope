import type { Task } from '$lib/types';
import { stringifyTodos } from '$lib';

/*
Returns a system message that will provide context to the LLM on 
*/
export const getTaskContext = (
	strategic_goal: string | null | undefined,
	current_task: Task | null,
	unfinished_subtasks: Task[],
	finished_subtasks: Task[],
	title: string | null | undefined
): string => {
	const unfinished_subtasks_str = unfinished_subtasks.map((task) => stringifyTodos(task)).join('');
	const finished_subtasks_str = finished_subtasks.map((task) => stringifyTodos(task)).join('');

	const current_task_str = current_task
		? `${current_task.name}${
				current_task.description
					? `
Task description: ${current_task.description}
--end task description--`
					: ''
		  }`
		: null;

	const title_clause = title ? `,named ${title}` : '';
	const goal_clause =
		strategic_goal && strategic_goal.length > 0
			? `Their overall goal is this: ${strategic_goal} `
			: '';

	const prompt = `You are a project manager helping someone complete a project${title_clause}. ${goal_clause}
    ${
			current_task_str
				? `They are currently focusing on the following task: ${current_task_str}`
				: ''
		}
    ${
			unfinished_subtasks_str.length > 0
				? `They have split the task into the following subtasks: 
    ${unfinished_subtasks_str}`
				: ''
		}
    ${
			finished_subtasks_str.length > 0
				? `They have already completed the following subtasks: 
    ${finished_subtasks_str}`
				: ''
		}`;
	console.log(prompt);
	return prompt;
};
