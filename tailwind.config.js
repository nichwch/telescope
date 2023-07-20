/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'texture-orange': "url('/texture_orange.svg')",
				'texture-green': "url('/texture_green.svg')"
			}
		}
	},
	plugins: []
};
