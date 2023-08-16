import { STRIPE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, WH_SEC } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { error, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import type { Database } from '../../../DatabaseDefinitions';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

const stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2022-11-15'
});
const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PRO_ID = '';
const PLUS_ID = '';

export const POST: RequestHandler = async ({ request }) => {
	const json_body = await request.json();
	let event;
	if (WH_SEC) {
		// Get the signature sent by Stripe
		const signature = request.headers.get('stripe-signature');
		try {
			event = stripe.webhooks.constructEvent(json_body, signature!, WH_SEC);
		} catch (err) {
			console.log(`⚠️  Webhook signature verification failed.`, err);
			throw error(400);
		}
	}
	if (!event) throw error(400);
	console.log('webhook hit!');
	// console.dir(json_body, { depth: null });
	console.log(event);
	// Handle the event
	switch (event.type) {
		case 'subscription_schedule.created': {
			const paymentIntent = event.data.object;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const user_id = event.data.object.customer! as string;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const id = event.data.object.items?.[0].id;
			const plan = id === PRO_ID ? 'pro' : id === PLUS_ID ? 'plus' : 'free';
			console.log(id, plan);
			await supabase.from('accounts').update({ subscription: plan }).eq('user_id', user_id);
			// Then define and call a method to handle the successful payment intent.
			// handlePaymentIntentSucceeded(paymentIntent);
			break;
		}
		case 'payment_method.attached': {
			const paymentMethod = event.data.object;
			// Then define and call a method to handle the successful attachment of a PaymentMethod.
			// handlePaymentMethodAttached(paymentMethod);
			break;
		}
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}
	return new Response('Received', { status: 200 });
};
