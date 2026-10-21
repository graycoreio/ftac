import { expect, it } from 'vitest';
import { compileSlot } from './compileSlot.ts';
import { slotToYaml, isSlot } from './slotToYaml.ts';

const ctx = { env: {}, datasets: {} };
const slot = (value: string) => ({ value, type: 'Expression' });

it('makes an expression a lone ${{ }}', () => expect(slotToYaml(slot("@int(variables('n'))"))).toBe('${{ int(vars.n) }}'));
it('keeps text as text', () => expect(slotToYaml(slot('Sales/Orders'))).toBe('Sales/Orders'));
it('keeps empty text', () => expect(slotToYaml(slot(''))).toBe(''));
it('makes interpolated text a mix', () => expect(slotToYaml(slot("a/@{variables('p')}/b"))).toBe('a/${{ vars.p }}/b'));
it('rejects text a ${{ in would turn into a template', () => expect(slotToYaml(slot('echo ${{ x }}'))).toBeUndefined());
it('rejects an @@ escape and all-interpolation text, which the compiler never writes', () => {
    expect(slotToYaml(slot('@@literal'))).toBeUndefined();
    expect(slotToYaml(slot("@{variables('x')} rows"))).toBeUndefined();
});
it('rejects anything but a slot', () => {
    expect(slotToYaml('text')).toBeUndefined();
    expect(slotToYaml({ value: '@x', type: 'Expression', extra: 1 })).toBeUndefined();
    expect(isSlot({ value: 1, type: 'Expression' })).toBe(false);
});

// Every value the compiler produces reads back to YAML that compiles to it again.
it.each([
    '${{ int(vars.n) }}',
    "${{ if(empty(inputs.date), formatDateTime(utcNow(), 'yyyy-MM-dd'), inputs.date) }}",
    "${{ concat('Hello/', formatDateTime(vars.date, 'yyyyMM')) }}",
    'Sales/Orders',
    'a/${{ vars.p }}/b',
    'SELECT 1 AS one\nWHERE ${{ sql(vars.date) }}::date <= CURRENT_DATE',
    "SELECT * FROM t WHERE a = ${{ sql(item.a) }} AND b = ${{ sql(concat(inputs.b, '%')) }}",
    '${{ pipeline().RunId }}',
    'rows: ${{ steps.load.outputs.rowsCopied }}',
])('round-trips %s', (yaml) => {
    const compiled = compileSlot(yaml, ctx);
    expect(compileSlot(slotToYaml(compiled)!, ctx)).toEqual(compiled);
});
