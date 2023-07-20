import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { model } from '../openai';
import { flattenTODO, stringifyTodos } from '$lib';
import type { TODO } from '$lib/types';

// don't consider entire task tree
export async function simple_task_suggestion_chain(
	strategic_goal: string,
	current_task: TODO,
	unfinished_subtasks: TODO[],
	finished_subtasks: TODO[],
	task_prompt: string
) {
	const unfinished_subtasks_str = unfinished_subtasks
		.map(flattenTODO)
		.map((task) => stringifyTodos(task))
		.join('');
	const finished_subtasks_str = finished_subtasks
		.map(flattenTODO)
		.map((task) => stringifyTodos(task))
		.join('');
	const parser = new CommaSeparatedListOutputParser();
	const formatInstructions = parser.getFormatInstructions();
	const current_task_str = `${current_task.name}${
		current_task.description
			? `
Task description: ${current_task.description}
--end task description--`
			: ''
	}`;

	const prompt = `You are a personal assistant helping someone complete a project. Their overall goal is this: ${strategic_goal}
${current_task ? `They are currently focusing on the following task: ${current_task_str}` : ''}
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
Here are more instructions on how to break down this task: ${task_prompt}`
			: ''
	}
Do not repeat any subtasks that are already listed.
Do not preface your response with anything, just give the subtasks. 
If there are no more suitable tasks, simply output nothing instead of repeating tasks. 
Aim to provide around 7-10 items, separated by commas. ${formatInstructions}
	`;

	console.log(prompt);
	const res = await model.call(prompt);
	const formatted_res = await parser.parse(res);
	console.log(res);
	console.log(formatted_res);
	return { formatted_res };
}
