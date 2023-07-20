import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { model } from '../openai';

// don't consider entire task tree
export async function simple_task_suggestion_chain(
	strategic_goal: string,
	cleaned_current_task: string,
	unfinished_subtasks: string,
	finished_subtasks: string,
	task_prompt: string
) {
	const parser = new CommaSeparatedListOutputParser();
	const formatInstructions = parser.getFormatInstructions();

	const prompt = `You are a personal assistant helping someone complete a project. Their overall goal is this: ${strategic_goal}
${
	cleaned_current_task
		? `They are currently focusing on the following task: ${cleaned_current_task}`
		: ''
}
${
	unfinished_subtasks
		? `They have split the task into the following subtasks: ${unfinished_subtasks}`
		: ''
}
${
	finished_subtasks
		? `They have already completed the following subtasks: ${finished_subtasks}`
		: ''
}
Help them break down this task into more subtasks.
${task_prompt ? `Here are more instructions on how to break down this task: ${task_prompt}` : ''}
Do not repeat any subtasks that are already listed.
Do not preface your response with anything, just give the subtasks. 
If there are no more suitable tasks, simply output nothing instead of repeating tasks. 
Aim to provide around 7-10 items, separated by commas. ${formatInstructions}
	`;

	console.log(prompt);
	const res = await model.call(prompt);
	const formatted_res = await parser.parse(res);
	console.log(formatted_res);
	return { formatted_res };
}
