import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import type { RequestHandler } from './$types';
import { model } from '$lib/server/openai';
import type { TODO } from '$lib/types';
import { json } from '@sveltejs/kit';

export const GET = (async ({ url }) => {
	const strategic_goal = url.searchParams.get('strategic_goal') || '';
	const todo_list = JSON.parse(url.searchParams.get('todo_list') || '[]') as TODO[];
	const current_task = JSON.parse(url.searchParams.get('current_task') || '{}');
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
	const template = `You are a personal assistant helping someone complete a project. The overall goal of your client's project is: {strategic_goal}
They have created a nested todo list of the tasks they will work on. The children field specifies subtasks that tasks are broken down into.
Here are the tasks they have finished: 
{cleaned_finished_tasks} 

Here are the tasks they plan to work on:
{cleaned_unfinished_tasks}

They are currently focusing on the following task: {cleaned_current_task} 

They have split the task into the following subtasks: {current_task_subtasks}

List some subtasks this task could be broken down into. Do not repeat any tasks that are already listed. Make sure you addressing the current task 
they are focusing on, not the entire todo list. Do not preface your response with anything, just give the subtasks. If there are no more suitable tasks, simply output nothing instead of repeating tasks. Aim to provide around 4-7 items. {formatInstructions}
	`;

	const parser = new CommaSeparatedListOutputParser();
	const promptA = new PromptTemplate({
		template,
		inputVariables: [
			'strategic_goal',
			'cleaned_finished_tasks',
			'cleaned_unfinished_tasks',
			'cleaned_current_task',
			'current_task_subtasks'
		],
		partialVariables: {
			formatInstructions: parser.getFormatInstructions()
		}
	});
	console.dir(
		{
			strategic_goal,
			cleaned_finished_tasks,
			cleaned_unfinished_tasks,
			cleaned_current_task,
			current_task_subtasks
		},
		{ depth: null }
	);
	const formattedPrompt = await promptA.format({
		strategic_goal,
		cleaned_finished_tasks: cleaned_finished_tasks.map((task) => stringifyTodos(task)).join(''),
		cleaned_unfinished_tasks: cleaned_unfinished_tasks.map((task) => stringifyTodos(task)).join(''),
		cleaned_current_task: stringifyTodos(cleaned_current_task),
		current_task_subtasks: stringifyTodos(current_task_subtasks)
	});
	console.log(`${formattedPrompt}`);
	const res = await model.call(formattedPrompt);
	const formatted_res = await parser.parse(res);
	console.dir({ res, formatted_res }, { depth: null });
	return json(formatted_res);
}) satisfies RequestHandler;
