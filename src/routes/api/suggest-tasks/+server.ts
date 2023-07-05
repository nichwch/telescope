import { PromptTemplate } from 'langchain';
import type { RequestHandler } from './$types';
import { model } from '$lib/server/openai';

export const GET = (async ({ url }) => {
	const strategic_goal = url.searchParams.get('strategic_goal') || '';
	const todo_list = JSON.parse(url.searchParams.get('todo_list') || '{}');
	const current_task = JSON.parse(url.searchParams.get('current_task') || '{}');

	const template = `You are a personal assistant helping a client complete a project. The overall goal of the client's project is: {strategic_goal}?
	
	They have created a nested todo list of the tasks they will work on, which is here:
	{todo_list}

	They are currently focusing on the following task: {current_task}
	
	Suggest some subtasks this task could be broken down into. Try not to repeat any tasks that have been suggested already.
	`;
	const promptA = new PromptTemplate({
		template,
		inputVariables: ['strategic_goal', 'todo_list', 'current_task']
	});
	console.dir({ promptA }, { depth: null });
	const res = await model.call(
		await promptA.format({
			strategic_goal,
			todo_list,
			current_task
		})
	);
	console.dir({ res }, { depth: null });
	return new Response(res);
}) satisfies RequestHandler;
