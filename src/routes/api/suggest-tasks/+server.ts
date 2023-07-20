import type { RequestHandler } from './$types';
import type { TODO } from '$lib/types';
import { json } from '@sveltejs/kit';
import { simple_task_suggestion_chain } from '$lib/server/chains/simple_task_suggestion';
import { stringifyTodos } from '$lib';

export const POST = (async ({ request }) => {
	const json_body = await request.json();
	const strategic_goal = json_body.strategic_goal || '';
	const focused_tasks = (json_body.focused_tasks || []) as TODO[];
	const current_task = json_body.current_task || {};
	const task_prompt = json_body.task_prompt || '';

	const finished_tasks = focused_tasks.filter((task: TODO) => task.done);
	const unfinished_tasks = focused_tasks.filter((task: TODO) => !task.done);

	const cleaned_current_task = {
		name: current_task.name,
		description: current_task.description
	};

	const { formatted_res } = await simple_task_suggestion_chain(
		strategic_goal,
		stringifyTodos(cleaned_current_task),
		finished_tasks.map((task) => stringifyTodos(task)).join(''),
		unfinished_tasks.map((task) => stringifyTodos(task)).join(''),
		task_prompt
	);
	return json(formatted_res);
}) satisfies RequestHandler;
