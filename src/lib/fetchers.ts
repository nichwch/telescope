import type { ChatCompletionRequestMessage } from 'openai';
import type { IntermediateTask } from './types';

export const fetchAITaskSuggestions = async (
	strategic_goal: string,
	focused_tasks: IntermediateTask[],
	current_task: IntermediateTask | null,
	task_prompt: string
) => {
	const res = await fetch('/api/suggest-tasks', {
		method: 'POST',
		body: JSON.stringify({
			strategic_goal,
			focused_tasks: focused_tasks,
			current_task: current_task,
			task_prompt: task_prompt
		})
	});
	return await res.json();
};

export const submitChatMessage = async (
	messages: ChatCompletionRequestMessage[]
): Promise<ChatCompletionRequestMessage> => {
	const res = await fetch('/api/chat-with-task', {
		method: 'POST',
		body: JSON.stringify({
			messages
		})
	});
	return await res.json();
};
