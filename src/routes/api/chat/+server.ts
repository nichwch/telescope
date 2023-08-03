import { DEFAULT_MODEL_SETTINGS, openai } from '$lib/server/openai';
import type { RequestHandler } from './$types';
import { OpenAIStream, StreamingTextResponse, type Message } from 'ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { supabase } = locals;
	// TODO: will need context of the task inserted as the first message.
	const json_body = await request.json();
	const response = await openai.createChatCompletion({
		...DEFAULT_MODEL_SETTINGS,
		messages: json_body.messages
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
			await supabase
				.from('tasks')
				.update({ chats: newMessages as any })
				.eq('id', json_body.task_id);
		}
	});
	return new StreamingTextResponse(stream);
};
