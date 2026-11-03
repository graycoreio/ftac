import { compileValue } from './compileValue.ts';
import { expressionToYaml } from './expressionToYaml.ts';

const LITERAL = /^'((?:[^']|'')*)'$/s;

/** The top-level arguments of concat(...), or undefined when the source is not one call to it. */
function concatArgs(source: string): string[] | undefined {
    if (!source.startsWith('concat(') || !source.endsWith(')')) return undefined;
    const args: string[] = [];
    let depth = 0;
    let start = 7;
    for (let i = 7; i < source.length - 1; i++) {
        const c = source[i];
        if (c === "'") {
            i++;
            while (source[i] !== "'" || source[i + 1] === "'") {
                if (i >= source.length) return undefined;
                i += source[i] === "'" ? 2 : 1;
            }
        } else if (c === '(') depth++;
        else if (c === ')' && --depth < 0) return undefined;
        else if (c === ',' && !depth) {
            args.push(source.slice(start, i).trim());
            start = i + 1;
        }
    }
    if (depth) return undefined;
    return [...args, source.slice(start, -1).trim()];
}

const unquote = (literal: string) => LITERAL.exec(literal)?.[1].replaceAll("''", "'");

/** A concat() with a literal among its arguments as mixed text: concat('a-', x) -> a-${{ x }}. */
function mixed(source: string): string | undefined {
    const args = concatArgs(source);
    if (!args?.some((a) => LITERAL.test(a))) return undefined;
    let out = '';
    for (const a of args) {
        const text = unquote(a);
        const inner = text === undefined ? expressionToYaml(a) : undefined;
        if (text === undefined && inner === undefined) return undefined;
        out += text ?? `\${{ ${inner} }}`;
    }
    return out;
}

/**
 * Expression source as a YAML value for set-variable or fail: the inverse of
 * compileValue. A string literal is plain text, a concat() with literals is
 * mixed text, and anything else is a lone `${{ }}`. Undefined when no YAML
 * value compiles to exactly the source.
 */
export function valueToYaml(source: string): string | undefined {
    const inner = expressionToYaml(source);
    const candidates = [mixed(source), unquote(source), inner === undefined ? undefined : `\${{ ${inner} }}`];
    for (const yaml of candidates) {
        if (yaml === undefined) continue;
        try {
            if (compileValue(yaml, { env: {}, datasets: {} }) === source) return yaml;
        } catch {
            // the next candidate, if any
        }
    }
    return undefined;
}
