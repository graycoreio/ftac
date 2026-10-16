import { compileExample } from './compileExample.ts';
import type { Action } from './types.ts';

/** One action's reference page as Markdown: inputs, rules, the example, and what it compiles to. */
export function renderActionDoc(action: Action): string {
    const out: string[] = [
        `# ${action.name}`,
        '',
        'GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).',
        '',
        action.description,
        '',
        '| `with:` | Takes |',
        '| --- | --- |',
        ...Object.entries(action.inputs).map(([k, v]) => `| \`${k}\` | ${v} |`),
        '',
        action.steps === 'required' ? 'Nested `steps:` are required.' : 'Takes no nested `steps:`.',
        action.policy === false
            ? 'Takes no `timeout:` or `retry:`.'
            : '`timeout:` (HH:MM:SS or D.HH:MM:SS) and `retry: { count, interval }` apply; the default is the portal policy.',
        '',
        '## Example',
        '',
        '```yaml',
        action.example,
        '```',
    ];
    const ctx = action.exampleContext;
    if (ctx?.env || ctx?.datasets) {
        out.push('', 'with, elsewhere in the file:', '', '```yaml');
        if (ctx.env) out.push('env:', ...Object.entries(ctx.env).map(([k, v]) => `  ${k}: ${v}`));
        if (ctx.datasets)
            out.push(
                'datasets:',
                ...Object.entries(ctx.datasets).flatMap(([name, d]) => {
                    const [kind, body] = Object.entries(d)[0] as [string, Record<string, unknown>];
                    return [`  ${name}:`, `    ${kind}:`, ...Object.entries(body).map(([k, v]) => `      ${k}: ${String(v)}`)];
                })
            );
        out.push('```');
    }
    out.push('', '## Compiles to', '', '```json', JSON.stringify(compileExample(action), null, 2), '```', '');
    return out.join('\n');
}
