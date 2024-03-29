import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { model } from '../openai';

export async function task_suggestion_chain(
	strategic_goal: string,
	cleaned_finished_tasks: string,
	cleaned_unfinished_tasks: string,
	cleaned_current_task: string,
	current_task_subtasks: string
) {
	const template = `You are a personal assistant helping someone complete a project. The overall goal of your client's project is: {strategic_goal}
They have created a nested todo list of the tasks they will work on. The children field specifies subtasks that tasks are broken down into.
Here are the tasks they have finished: 
{cleaned_finished_tasks} 

Here are the tasks they plan to work on:
{cleaned_unfinished_tasks}

They are currently focusing on the following task: {cleaned_current_task} 

They have split the task into the following subtasks: {current_task_subtasks}

List some subtasks this task could be broken down into. Do not preface your response with anything, just give the subtasks, separated by commas. Do not repeat any tasks that are already listed. Make sure you addressing the current task 
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
		cleaned_finished_tasks,
		cleaned_unfinished_tasks,
		cleaned_current_task,
		current_task_subtasks
	});

	console.log(`${formattedPrompt}`);
	const res = await model.call(formattedPrompt);
	const formatted_res = await parser.parse(res);
	return { res, formatted_res };
}
