// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
		mermaid(),
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
