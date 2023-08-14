import { DEFAULT_MODEL_SETTINGS, openai } from '$lib/server/openai';
import { getRoleAndGoalContext, getTaskContext } from '$lib/getTaskContext';
import type { RequestHandler } from './$types';
import { OpenAIStream, StreamingTextResponse, type Message } from 'ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { supabase } = locals;
	// TODO: will need context of the task inserted as the first message.
	const json_body = await request.json();
	// console.dir(json_body, null);
	const { strategic_goal, title, focused_tasks, current_task } = json_body;
	const taskContext = getTaskContext(
		current_task,
		focused_tasks?.filter((item: any) => !item.done) || [],
		focused_tasks?.filter((item: any) => item.done) || []
	);
	const roleAndGoalContext = getRoleAndGoalContext(strategic_goal, title);
	const messagesAndContext = [
		{
			role: 'system',
			content: roleAndGoalContext
		},
		...json_body.messages,
		{
			role: 'system',
			content: `${taskContext}
Note that context may have changed since previous messages, so don't apologize for discrepancies.`
		}
	];
	const response = await openai.createChatCompletion({
		...DEFAULT_MODEL_SETTINGS,
		messages: messagesAndContext
	});
	const stream = OpenAIStream(response, {
		onCompletion: async (completion: string) => {
			/*
			filter out the system message, because we update it every time the user opens
			a chat
			*/
			const newMessages: Message[] = [
				...json_body.messages,
				{ content: completion, role: 'assistant' }
			].filter((message) => message.role !== 'system');
			if (json_body.task_id) {
				await supabase
					.from('tasks')
					.update({ chats: newMessages as any })
					.eq('id', json_body.task_id);
			} else if (json_body.list_id) {
				await supabase
					.from('lists')
					.update({ chats: newMessages as any })
					.eq('id', json_body.list_id);
			}
		}
	});
	return new StreamingTextResponse(stream);
};
