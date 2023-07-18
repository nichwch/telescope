import type { RequestHandler } from './$types';
import type { TODO } from '$lib/types';
import { json } from '@sveltejs/kit';
import { task_suggestion_chain } from '$lib/server/chains/task_suggestion';

export const POST = (async ({ request }) => {
	const json_body = await request.json();
	const strategic_goal = json_body.strategic_goal || '';
	const todo_list = (json_body.todo_list || []) as TODO[];
	const current_task = json_body.current_task || {};

	const finished_tasks = todo_list.filter((task: TODO) => task.done);
	const unfinished_tasks = todo_list.filter((task: TODO) => !task.done);
	type SimplifiedTODO = Omit<Partial<TODO>, 'children'> & { children?: SimplifiedTODO[] };
	// clean out useless information like id and done fields, to save on tokens
	const cleaning_function = (task: SimplifiedTODO): SimplifiedTODO => ({
		name: task.name,
		description: task.description,
		children: task?.children?.map(cleaning_function)
	});
	const flat_cleaning_function = (task: SimplifiedTODO): SimplifiedTODO => ({
		name: task.name,
		description: task.description
	});

	const stringifyTodos = (task: SimplifiedTODO, prefix = ''): string => {
		return `${prefix}name: ${task?.name || 'untitled'}
${prefix}description:${task?.description?.trim() || ''}
${
	task?.children
		? prefix +
		  'subtasks:\n' +
		  task?.children?.map((child) => stringifyTodos(child, `${prefix}  `)).join('')
		: ''
}\n`;
	};

	// no need for finished tasks to contain child tasks, since they are not being worked on. keep them flat
	const cleaned_finished_tasks = finished_tasks.map(flat_cleaning_function);
	const cleaned_unfinished_tasks = unfinished_tasks.map(cleaning_function);
	const cleaned_current_task = {
		name: current_task.name,
		description: current_task.description
	};
	const current_task_subtasks = current_task.children?.map(flat_cleaning_function);

	const { res, formatted_res } = await task_suggestion_chain(
		strategic_goal,
		cleaned_finished_tasks.map((task) => stringifyTodos(task)).join(''),
		cleaned_unfinished_tasks.map((task) => stringifyTodos(task)).join(''),
		stringifyTodos(cleaned_current_task),
		stringifyTodos(current_task_subtasks)
	);
	console.dir({ res, formatted_res }, { depth: null });
	return json(formatted_res);
}) satisfies RequestHandler;
