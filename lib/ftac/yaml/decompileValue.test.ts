import { expect, it } from 'vitest';
import { compileValue } from './compileValue.ts';
import { decompileValue } from './decompileValue.ts';

const ctx = { env: {}, datasets: {} };

it('makes a string literal plain text', () => expect(decompileValue("'it''s -1'")).toBe("it's -1"));
it('makes a concat() with literals mixed text', () => expect(decompileValue("concat('a-', variables('x'), '-b')")).toBe('a-${{ vars.x }}-b'));
it('keeps a concat() of expressions only as one ${{ }}', () => expect(decompileValue("concat(variables('a'), variables('b'))")).toBe('${{ concat(vars.a, vars.b) }}'));
it('makes anything else a lone ${{ }}', () => expect(decompileValue("string(variables('n'))")).toBe('${{ string(vars.n) }}'));
it('keeps the empty literal an expression, as empty text compiles to concat()', () => expect(decompileValue("''")).toBe("${{ '' }}"));
it('keeps adjacent literals in a concat() an expression, as they would merge', () =>
    expect(decompileValue("concat('a', 'b', variables('x'))")).toBe("${{ concat('a', 'b', vars.x) }}"));
it('handles commas and parentheses inside arguments', () =>
    expect(decompileValue("concat('a, (b', formatDateTime(utcNow(), 'yyyy, MM'))")).toBe("a, (b${{ formatDateTime(utcNow(), 'yyyy, MM') }}"));
it('rejects source no ${{ }} can hold', () => expect(decompileValue(`json('{"a":{"b":1}}')`)).toBeUndefined());

it.each(['-1', '${{ string(vars.n) }}', 'a-${{ vars.x }}', 'Bronze table ${{ item.table_name }} is empty', "${{ if(empty(inputs.date), utcNow(), inputs.date) }}"])(
    'round-trips %s',
    (yaml) => {
        const source = compileValue(yaml, ctx);
        expect(compileValue(decompileValue(source)!, ctx)).toBe(source);
    }
);
