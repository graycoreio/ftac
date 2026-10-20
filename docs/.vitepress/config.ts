import { defineConfig, type HeadConfig, type PageData } from 'vitepress';
import { registry } from '../../lib/ftac/yaml/actions/registry.ts';
import { moduleName } from '../../lib/ftac/yaml/actions/renderActionsDoc.ts';

const REPO = 'https://github.com/graycoreio/ftac';
const TITLE = 'FTAC';
const DESCRIPTION = 'Fabric pipelines, written like GitHub Actions.';
// '/' locally; CI sets DOCS_BASE to the project-page path.
const BASE = process.env.DOCS_BASE ?? '/';
// Where the site is served from; absolute URLs (canonical, og:image, schema) are built on it.
const SITE_URL = new URL(BASE, process.env.DOCS_ORIGIN ?? 'https://graycoreio.github.io').href;
const OG_IMAGE = { url: `${SITE_URL}og.png`, width: 1200, height: 630, alt: `${TITLE}: ${DESCRIPTION}` };

const PUBLISHER = { '@type': 'Organization', name: 'Graycore, LLC', url: 'https://graycore.io' };
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE_URL}#website`, url: SITE_URL, name: TITLE, description: DESCRIPTION, publisher: PUBLISHER };
const SOFTWARE = {
    '@type': 'SoftwareSourceCode',
    '@id': `${SITE_URL}#software`,
    name: TITLE,
    alternateName: 'Fabric Terraform Actions Compiler',
    description: DESCRIPTION,
    url: SITE_URL,
    codeRepository: REPO,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Node.js',
    license: `${REPO}/blob/main/LICENSE`,
    author: PUBLISHER,
};

/** The page's URL under cleanUrls: `guide/index.md` -> `guide/`, `guide/getting-started.md` -> `guide/getting-started`. */
function pageUrl(relativePath: string): string {
    return SITE_URL + relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
}

/** OpenGraph, Twitter card, canonical link and JSON-LD for one page. */
function socialHead(page: PageData): HeadConfig[] {
    const home = page.relativePath === 'index.md';
    const url = pageUrl(page.relativePath);
    const title = home ? TITLE : `${page.title} | ${TITLE}`;
    const description = page.description || DESCRIPTION;
    const modified = page.lastUpdated ? new Date(page.lastUpdated).toISOString() : undefined;
    const article = {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline: page.title,
        description,
        url,
        ...(modified && { dateModified: modified }),
        author: PUBLISHER,
        publisher: PUBLISHER,
        isPartOf: { '@id': WEBSITE['@id'] },
        about: { '@id': SOFTWARE['@id'] },
    };
    const schema = { '@context': 'https://schema.org', '@graph': home ? [WEBSITE, SOFTWARE] : [WEBSITE, SOFTWARE, article] };
    return [
        ['link', { rel: 'canonical', href: url }],
        ['meta', { property: 'og:type', content: home ? 'website' : 'article' }],
        ['meta', { property: 'og:site_name', content: TITLE }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: url }],
        ['meta', { property: 'og:image', content: OG_IMAGE.url }],
        ['meta', { property: 'og:image:width', content: String(OG_IMAGE.width) }],
        ['meta', { property: 'og:image:height', content: String(OG_IMAGE.height) }],
        ['meta', { property: 'og:image:alt', content: OG_IMAGE.alt }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: title }],
        ['meta', { name: 'twitter:description', content: description }],
        ['meta', { name: 'twitter:image', content: OG_IMAGE.url }],
        ['meta', { name: 'twitter:image:alt', content: OG_IMAGE.alt }],
        // `<` is escaped so no content can close the script element.
        ['script', { type: 'application/ld+json' }, JSON.stringify(schema).replace(/</g, '\\u003c')],
    ];
}

export default defineConfig({
    title: TITLE,
    base: BASE,
    description: DESCRIPTION,
    cleanUrls: true,
    lastUpdated: true,
    // VitePress does not prefix `base` onto head entries, so each href carries it.
    // The SVG is listed last so browsers that support it prefer it over the PNG.
    head: [
        ['link', { rel: 'icon', type: 'image/png', sizes: '48x48', href: `${BASE}favicon.png` }],
        ['link', { rel: 'icon', type: 'image/svg+xml', href: `${BASE}logo.svg` }],
        ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${BASE}apple-touch-icon.png` }],
    ],
    srcExclude: ['developer/**'],
    transformPageData(pageData) {
        pageData.frontmatter.head = [...(pageData.frontmatter.head ?? []), ...socialHead(pageData)];
    },
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
        logo: '/logo.svg',
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
                    ],
                },
            ],
            '/reference/': [
                { text: 'Pipeline syntax', link: '/reference/pipeline-syntax' },
                { text: 'Expressions', link: '/reference/expressions' },
                {
                    text: 'Executors',
                    link: '/reference/executors/',
                    items: [
                        { text: 'build', link: '/reference/executors/build' },
                        { text: 'decompile', link: '/reference/executors/decompile' },
                    ],
                },
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
        footer: { message: 'Released under the <a href="https://github.com/graycoreio/ftac/blob/main/LICENSE">MIT License</a>.', copyright: 'Copyright © 2026 Graycore, LLC' },
    },
});
