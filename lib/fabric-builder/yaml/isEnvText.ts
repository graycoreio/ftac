import type { Context } from './types.ts';

/**
 * When an expression is exactly `env.NAME` and that env value is plain
 * text (not itself `${{ }}`), return the text: the reference is a macro,
 * not something to evaluate.
 */
export function isEnvText(inner: string, ctx: Context): string | undefined {
    const m = /^env\.([A-Za-z_]\w*)$/.exec(inner.trim());
    if (!m) return undefined;
    const v = ctx.env[m[1]];
    if (v === undefined) throw new Error(`env.${m[1]} is not defined`);
    return v.includes('${{') ? undefined : v;
}
