/** ADF references and their Actions-style spelling. Names must be identifiers; anything else stays native. */
const REFS: [RegExp, (m: RegExpExecArray) => string][] = [
    [/pipeline\(\)\.parameters\.([A-Za-z_]\w*)/y, (m) => `inputs.${m[1]}`],
    [/variables\('([A-Za-z_]\w*)'\)/y, (m) => `vars.${m[1]}`],
    [/activity\('([A-Za-z_]\w*)'\)\.output(?!\w)/y, (m) => `steps.${m[1]}.outputs`],
    [/item\(\)/y, () => 'item'],
];

/**
 * Rewrite ADF references in expression source to their Actions-style
 * spelling: the inverse of rewriteRefs.
 *   pipeline().parameters.x  -> inputs.x
 *   variables('x')           -> vars.x
 *   activity('x').output.y   -> steps.x.outputs.y
 *   item().x                 -> item.x
 * String literals are left alone. Undefined when a literal is unterminated.
 */
export function decompileRefs(source: string): string | undefined {
    let out = '';
    let i = 0;
    outer: while (i < source.length) {
        if (source[i] === "'") {
            let j = i + 1;
            while (source[j] !== "'" || source[j + 1] === "'") {
                if (j >= source.length) return undefined;
                j += source[j] === "'" ? 2 : 1;
            }
            out += source.slice(i, j + 1);
            i = j + 1;
            continue;
        }
        if (!/[\w.]/.test(source[i - 1] ?? '')) {
            for (const [re, to] of REFS) {
                re.lastIndex = i;
                const m = re.exec(source);
                if (m) {
                    out += to(m);
                    i += m[0].length;
                    continue outer;
                }
            }
        }
        out += source[i++];
    }
    return out;
}
