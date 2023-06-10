// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('HOOKS');
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};
	console.log('hm', event.url.pathname);
	if (event.url.pathname.startsWith('/app')) {
		console.log('APP', event.url.pathname);
		const session = await event.locals.getSession();
		if (!session) {
			console.log('redirect');
			// the user is not signed in
			throw redirect(307, '/');
		}
	}

	if (event.url.pathname.startsWith('/auth')) {
		console.log('AUTH', event.url.pathname);
		const session = await event.locals.getSession();
		if (session) {
			console.log('redirect');
			// the user is not signed in
			throw redirect(307, '/app');
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
