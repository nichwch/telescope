import { DEFAULT_MODEL_SETTINGS, openai } from '$lib/server/openai';
import type { RequestHandler } from './$types';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const POST: RequestHandler = async ({ request }) => {
	// TODO: will need context of the task inserted as the first message.
	const json_body = await request.json();
	const response = await openai.createChatCompletion({
		...DEFAULT_MODEL_SETTINGS,
		messages: json_body.messages
	});
	const stream = OpenAIStream(response);
	console.log(new StreamingTextResponse(stream));
	return new StreamingTextResponse(stream);
};
