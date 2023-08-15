import { STRIPE_API_KEY, WH_SEC } from '$env/static/private';
import { error, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_API_KEY, {});
export const POST: RequestHandler = async ({ request, locals }) => {
	const json_body = await request.json();
	let event;
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
	if (!event) return error(400);
	console.log('webhook hit!');
	console.dir(json_body, { depth: null });

	// Handle the event
	switch (event.type) {
		case 'payment_intent.succeeded':
			const paymentIntent = event.data.object;
			console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
			// Then define and call a method to handle the successful payment intent.
			// handlePaymentIntentSucceeded(paymentIntent);
			break;
		case 'payment_method.attached':
			const paymentMethod = event.data.object;
			// Then define and call a method to handle the successful attachment of a PaymentMethod.
			// handlePaymentMethodAttached(paymentMethod);
			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}
	return new Response('Received', { status: 200 });
};
