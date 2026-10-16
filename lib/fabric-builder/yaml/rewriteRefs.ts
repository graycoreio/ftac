import { str } from '../expr/str.ts';
import { tokenizeExpression } from './tokenizeExpression.ts';
import type { Context } from './types.ts';

const REF = /(?<![\w.])(inputs|vars|steps|env|item)((?:\.[A-Za-z_]\w*)*)(?!\s*\()/g;

/**
 * Rewrite Actions-style references inside ADF expression source:
 *   inputs.x            -> pipeline().parameters.x
 *   vars.x              -> variables('x')
 *   steps.x.outputs.y   -> activity('x').output.y
 *   item.x              -> item().x
 *   env.X               -> the env text as a literal, or its expression source
 * String literals are left alone. Everything else passes through, so the
 * functions are ADF's own.
 */
export function rewriteRefs(source: string, ctx: Context, seen: string[] = []): string {
    return tokenizeExpression(source)
        .map((seg) => (seg.kind === 'literal' ? seg.text : seg.text.replace(REF, (_, head: string, path: string) => rewrite(head, path, ctx, seen))))
        .join('');
}

function rewrite(head: string, path: string, ctx: Context, seen: string[]): string {
    const names = path.split('.').filter(Boolean);
    const first = names[0];
    const rest = names.slice(1).map((n) => `.${n}`).join('');
    switch (head) {
        case 'inputs':
            if (!first) throw new Error('inputs must be followed by a parameter name');
            return `pipeline().parameters.${first}${rest}`;
        case 'vars':
            if (!first) throw new Error('vars must be followed by a variable name');
            return `variables(${str(first)})${rest}`;
        case 'steps':
            if (!first || names[1] !== 'outputs') throw new Error(`steps.${first ?? ''} must be followed by .outputs`);
            return `activity(${str(first)}).output${names.slice(2).map((n) => `.${n}`).join('')}`;
        case 'item':
            return `item()${path}`;
        case 'env': {
            if (!first || rest) throw new Error(`env.${path.slice(1)}: expected exactly env.NAME`);
            const v = ctx.env[first];
            if (v === undefined) throw new Error(`env.${first} is not defined`);
            if (seen.includes(first)) throw new Error(`env.${first} refers to itself (${[...seen, first].join(' -> ')})`);
            const m = /^\s*\$\{\{(.*)\}\}\s*$/s.exec(v);
            return m ? rewriteRefs(m[1].trim(), ctx, [...seen, first]) : str(v);
        }
        default:
            return head + path;
    }
}
