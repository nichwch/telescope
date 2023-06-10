// src/routes/+layout.server.ts
export const load = async ({ locals: { getSession } }) => {
	console.log('layout.server.ts');
	return {
		session: await getSession()
	};
};
