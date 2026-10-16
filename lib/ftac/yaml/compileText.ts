import { isEnvText } from './isEnvText.ts';
import { splitTemplate } from './splitTemplate.ts';
import type { Context } from './types.ts';

/** A value that must be plain text (a connection id, a token name); only an env macro is allowed. */
export function compileText(value: string, ctx: Context, what: string): string {
    const parts = splitTemplate(value);
    if (parts.length === 1 && parts[0].kind === 'text') return parts[0].text;
    if (parts.length === 1 && parts[0].kind === 'expr') {
        const macro = isEnvText(parts[0].inner, ctx);
        if (macro !== undefined) return macro;
    }
    throw new Error(`${what} must be plain text or an env macro, got: ${value}`);
}
