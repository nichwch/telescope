import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	const json_body = await request.json();
	console.log('webhook hit!');
	console.dir(json_body, { depth: null });
	return new Response('Received', { status: 200 });
};
