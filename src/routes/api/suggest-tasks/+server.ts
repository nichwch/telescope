import type { RequestHandler } from './$types';
import type { Task } from '$lib/types';
import { json } from '@sveltejs/kit';
import { simple_task_suggestion_chain } from '$lib/server/chains/simple_task_suggestion';

export const POST = (async ({ request }) => {
	const json_body = await request.json();
	const strategic_goal = json_body.strategic_goal || '';
	const focused_tasks = (json_body.focused_tasks || []) as Task[];
	const current_task = json_body.current_task || null;
	const task_prompt = json_body.task_prompt || '';
	const title = json_body.title || null;

	const finished_tasks = focused_tasks.filter((task: Task) => task.done);
	const unfinished_tasks = focused_tasks.filter((task: Task) => !task.done);

	const { formatted_res } = await simple_task_suggestion_chain(
		strategic_goal,
		current_task,
		unfinished_tasks,
		finished_tasks,
		task_prompt,
		title
	);
	return json(formatted_res);
}) satisfies RequestHandler;
