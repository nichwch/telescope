import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { model } from '../openai';
import { stringifyTodos } from '$lib';
import type { Task } from '$lib/types';

// don't consider entire task tree
export async function simple_task_suggestion_chain(
	strategic_goal: string,
	current_task: Task | null,
	unfinished_subtasks: Task[],
	finished_subtasks: Task[],
	task_prompt: string,
	title: string | null
) {
	const unfinished_subtasks_str = unfinished_subtasks.map((task) => stringifyTodos(task)).join('');
	const finished_subtasks_str = finished_subtasks.map((task) => stringifyTodos(task)).join('');
	const parser = new CommaSeparatedListOutputParser();
	const formatInstructions = parser.getFormatInstructions();
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
		strategic_goal.length > 0 ? `Their overall goal is this: ${strategic_goal} ` : '';

	const prompt = `You are a project manager helping someone complete a project${title_clause}. ${goal_clause}
${current_task_str ? `They are currently focusing on the following task: ${current_task_str}` : ''}
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
}
Help them break down this task into more subtasks.${
		task_prompt
			? `
Here are more instructions on how to break down this task: ${task_prompt} Separate with commas.`
			: 'Separate with commas.'
	}
Do not repeat any tasks that are already listed. Provide new tasks. Aim to provide around 7-10 items. ${formatInstructions}
	`;

	console.log(prompt);
	const res = await model.call(prompt);
	const formatted_res = await parser.parse(res);
	console.log(res);
	console.log(formatted_res);
	return { formatted_res };
}
