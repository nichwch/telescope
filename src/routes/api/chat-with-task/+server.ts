import { DEFAULT_MODEL_SETTINGS, openai } from '$lib/server/openai';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// TODO: will need context of the task inserted as the first message.
	const json_body = await request.json();
	const { data: response } = await openai.createChatCompletion({
		...DEFAULT_MODEL_SETTINGS,
		messages: json_body.messages
	});
	return json(response.choices[0].message);
};
