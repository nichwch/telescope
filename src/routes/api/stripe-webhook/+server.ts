import { STRIPE_API_KEY, WH_SEC } from '$env/static/private';
import { error, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_API_KEY, {});
export const POST: RequestHandler = async ({ request, locals }) => {
	const json_body = await request.json();
	if (WH_SEC) {
		// Get the signature sent by Stripe
		const signature = request.headers.get('stripe-signature');
		try {
			event = stripe.webhooks.constructEvent(json_body, signature!, WH_SEC);
		} catch (err) {
			console.log(`⚠️  Webhook signature verification failed.`, err);
			return error(400);
		}
	}
	console.log('webhook hit!');
	console.dir(json_body, { depth: null });
	return new Response('Received', { status: 200 });
};
