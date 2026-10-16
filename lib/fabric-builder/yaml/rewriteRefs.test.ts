import { expect, it } from 'vitest';
import { rewriteRefs } from './rewriteRefs.ts';

const ctx = { env: { FOLDER: 'Sales/Orders', PERIOD: "${{ formatDateTime(vars.date_from, 'yyyyMM') }}", LOOP: '${{ env.LOOP }}' }, datasets: {} };

it('rewrites inputs, vars, steps, and item', () =>
    expect(rewriteRefs('concat(inputs.p, vars.v, steps.s.outputs.rowsCopied, item.t, item)', ctx)).toBe(
        "concat(pipeline().parameters.p, variables('v'), activity('s').output.rowsCopied, item().t, item())"
    ));
it('leaves string literals alone', () => expect(rewriteRefs("concat('vars.v', vars.v)", ctx)).toBe("concat('vars.v', variables('v'))"));
it('leaves ADF functions and existing calls alone', () => expect(rewriteRefs("not(empty(item()))", ctx)).toBe('not(empty(item()))'));
it('splices env text as a literal and env expressions as source', () =>
    expect(rewriteRefs("concat(env.FOLDER, '/', env.PERIOD)", ctx)).toBe("concat('Sales/Orders', '/', formatDateTime(variables('date_from'), 'yyyyMM'))"));
it('does not rewrite property names that look like references', () => expect(rewriteRefs('x.vars.y', ctx)).toBe('x.vars.y'));
it('rejects steps without .outputs', () => expect(() => rewriteRefs('steps.s.x', ctx)).toThrow(/\.outputs/));
it('rejects a bare vars', () => expect(() => rewriteRefs('vars', ctx)).toThrow(/variable name/));
it('rejects an env cycle', () => expect(() => rewriteRefs('env.LOOP', ctx)).toThrow(/refers to itself/));
it('rejects an unknown env', () => expect(() => rewriteRefs('env.NOPE', ctx)).toThrow(/not defined/));
