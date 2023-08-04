import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { model } from '../openai';
import type { Task } from '$lib/types';
import { getRoleAndGoalContext, getTaskContext } from '../../getTaskContext';

// don't consider entire task tree
export async function simple_task_suggestion_chain(
	strategic_goal: string,
	current_task: Task | null,
	unfinished_subtasks: Task[],
	finished_subtasks: Task[],
	task_prompt: string,
	title: string | null
) {
	const parser = new CommaSeparatedListOutputParser();
	const formatInstructions = parser.getFormatInstructions();
	const roleContext = getRoleAndGoalContext(strategic_goal, title);
	const taskContext = getTaskContext(current_task, unfinished_subtasks, finished_subtasks);

	const prompt = `${roleContext}
${taskContext}
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
