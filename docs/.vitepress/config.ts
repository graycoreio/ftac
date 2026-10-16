import { defineConfig } from 'vitepress';
import { registry } from '../../lib/fabric-builder/yaml/actions/registry.ts';
import { moduleName } from '../../lib/fabric-builder/yaml/actions/renderActionsDoc.ts';

const REPO = 'https://github.com/graycoreio/ftac';

export default defineConfig({
    title: 'FTAC',
    description: 'Fabric pipelines, written like GitHub Actions.',
    cleanUrls: true,
    srcExclude: ['developer/**'],
    markdown: {
        config(md) {
            // Inline code such as `${{ vars.date }}` is literal, not a Vue interpolation.
            // VitePress only protects fenced blocks by default.
            const code = md.renderer.rules.code_inline!;
            md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
                tokens[idx].attrSet('v-pre', '');
                return code(tokens, idx, options, env, self);
            };
        },
    },
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
            { text: 'Reference', link: '/reference/pipeline-syntax', activeMatch: '/reference/' },
        ],
        sidebar: {
            '/guide/': [
                {
                    text: 'Guide',
                    items: [
                        { text: 'What is FTAC?', link: '/guide/' },
                        { text: 'Getting started', link: '/guide/getting-started' },
                        { text: 'The TypeScript API', link: '/guide/typescript' },
                    ],
                },
            ],
            '/reference/': [
                { text: 'Pipeline syntax', link: '/reference/pipeline-syntax' },
                { text: 'Expressions', link: '/reference/expressions' },
                {
                    text: 'Actions',
                    link: '/reference/actions/',
                    items: [...registry.keys()].map((name) => ({ text: name, link: `/reference/actions/${moduleName(name)}` })),
                },
            ],
        },
        editLink: { pattern: `${REPO}/edit/main/docs/:path`, text: 'Edit this page on GitHub' },
        socialLinks: [{ icon: 'github', link: REPO }],
        search: { provider: 'local' },
        outline: [2, 3],
    },
});
