// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Metacult Engineering',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/mephyston/metacult' }
			],
			sidebar: [
				{
					label: '🏠 Onboarding',
					items: [
						{ label: 'Introduction', slug: 'intro' },
					],
				},
				{
					label: '🏗️ Architecture',
					autogenerate: { directory: 'architecture' },
				},
				{
					label: '📦 Modules',
					autogenerate: { directory: 'modules' },
				},
				{
					label: '🛠️ Guides',
					autogenerate: { directory: 'guides' },
				},
			],
		}),
	],
});
