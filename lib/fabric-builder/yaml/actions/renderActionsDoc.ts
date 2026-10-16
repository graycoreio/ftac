import { registry } from './registry.ts';
import { prose } from './renderActionDoc.ts';

/** The module file name of an action, and its page on the site: fabric/set-variable -> setVariable. */
export const moduleName = (name: string): string => name.replace(/^fabric\//, '').replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

/** The actions index page as Markdown, from the registry. */
export function renderActionsDoc(): string {
    return [
        '# Pre-built actions',
        '',
        'Every `uses:` names an action. These are the ones built in, as `fabric/<name>`.',
        'Each has its own page with its `with:` keys and an example.',
        '',
        'Every step also takes `id`, `needs`, `labels` (userProperties for monitoring), and, where noted, `timeout` / `retry` and nested `steps`.',
        'A step with `if:` takes no `uses:`; it is a group of nested steps.',
        '',
        ...[...registry.values()].map((a) => `- [\`${a.name}\`](${moduleName(a.name)}.md): ${prose(a.description.split('. ')[0].replace(/\.$/, ''))}.`),
        '',
    ].join('\n');
}
