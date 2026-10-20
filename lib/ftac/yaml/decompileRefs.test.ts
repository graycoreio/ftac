import { expect, it } from 'vitest';
import { decompileRefs } from './decompileRefs.ts';
import { rewriteRefs } from './rewriteRefs.ts';

const ctx = { env: {}, datasets: {} };

it('spells parameters, variables, outputs and items the Actions way', () =>
    expect(decompileRefs("concat(pipeline().parameters.p, variables('v'), activity('s').output.rowsCopied, item().t, item())")).toBe(
        'concat(inputs.p, vars.v, steps.s.outputs.rowsCopied, item.t, item)'
    ));
it('leaves string literals alone', () => expect(decompileRefs("concat('variables(''v'')', variables('v'))")).toBe("concat('variables(''v'')', vars.v)"));
it('keeps names that are not identifiers native', () =>
    expect(decompileRefs("concat(variables('my var'), activity('Copy data1').output, activity('it''s').output)")).toBe(
        "concat(variables('my var'), activity('Copy data1').output, activity('it''s').output)"
    ));
it('keeps bracket access after an output', () => expect(decompileRefs("activity('s').output['k']")).toBe("steps.s.outputs['k']"));
it('does not touch a reference that is part of a longer name', () =>
    expect(decompileRefs("x.item().a, myvariables('v'), activity('s').outputs")).toBe("x.item().a, myvariables('v'), activity('s').outputs"));
it('rejects an unterminated literal', () => expect(decompileRefs("concat('a")).toBeUndefined());

it.each([
    "concat(pipeline().parameters.p, variables('v'))",
    "if(empty(pipeline().parameters.date), formatDateTime(utcNow(), 'yyyy-MM-dd'), pipeline().parameters.date)",
    "greater(activity('load').output.rowsCopied, 0)",
    "activity('l').output.value[0].name",
    'item().table_name',
])('rewriteRefs undoes it: %s', (source) => expect(rewriteRefs(decompileRefs(source)!, ctx)).toBe(source));
