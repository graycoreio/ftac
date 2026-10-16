import { registry } from './registry.ts';

/** The module file name an action's docs sit beside: fabric/set-variable -> setVariable. */
export const moduleName = (name: string): string => name.replace(/^fabric\//, '').replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

/** The actions index as Markdown, from the registry. */
export function renderActionsDoc(): string {
    return [
        '# Pre-built actions',
        '',
        'GENERATED from `registry.ts` by `npx nx run fabric-builder:docs`; do not edit.',
        '',
        'Every `uses:` names an action. These are the ones built in, as `fabric/<name>`.',
        'Each has its own page with inputs, an example, and what the example compiles to.',
        '',
        'Every step also takes `id`, `needs`, `labels` (userProperties for monitoring), and, where noted, `timeout` / `retry` and nested `steps`.',
        'A step with `if:` takes no `uses:`; it is a group of nested steps.',
        '',
        '| Action | Purpose |',
        '| --- | --- |',
        ...[...registry.values()].map((a) => `| [\`${a.name}\`](${moduleName(a.name)}.md) | ${a.description.split('. ')[0].replace(/\.$/, '')} |`),
        '',
    ].join('\n');
}
