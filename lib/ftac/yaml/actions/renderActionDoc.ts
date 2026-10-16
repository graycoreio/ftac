import type { Action } from './types.ts';

/**
 * Prose from the registry as Markdown that renders the same on GitHub and in
 * VitePress: every `${{ }}` and `{{ }}` becomes inline code, and outside code
 * spans a `<` is not a tag and a `|` is not a table cell boundary.
 */
export function prose(text: string): string {
    return text
        .replace(/\$?\{\{.*?\}\}/g, (m) => `\`${m}\``)
        .split(/(`[^`]*`)/)
        .map((part, i) => (i % 2 ? part : part.replace(/[<|]/g, '\\$&')))
        .join('');
}

/**
 * One action's reference page as Markdown, in the shape of the GitHub Actions
 * workflow syntax reference: one heading per key with prose under it, then
 * the example.
 */
export function renderActionDoc(action: Action): string {
    const out: string[] = [
        `# ${action.name}`,
        '',
        prose(action.description),
        '',
        action.steps === 'required'
            ? 'The step takes nested `steps:`, and they are required.'
            : 'The step takes no nested `steps:`.',
        action.policy === false
            ? 'It takes no `timeout:` or `retry:`.'
            : 'It takes `timeout:` (`HH:MM:SS` or `D.HH:MM:SS`) and `retry: { count, interval }`; the default is the portal policy.',
        ...Object.entries(action.inputs).flatMap(([k, v]) => ['', `## \`with.${k}\``, '', prose(v)]),
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
    out.push('');
    return out.join('\n');
}
