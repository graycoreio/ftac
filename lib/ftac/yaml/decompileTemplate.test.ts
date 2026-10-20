import { expect, it } from 'vitest';
import { decompileTemplate } from './decompileTemplate.ts';

it('keeps text without interpolations', () => expect(decompileTemplate('Sales/Orders')).toBe('Sales/Orders'));
it('turns interpolations into ${{ }}', () => expect(decompileTemplate("a/@{variables('p')}/b")).toBe('a/${{ vars.p }}/b'));
it('turns a quoted, escaped interpolation into sql()', () =>
    expect(decompileTemplate("WHERE d <= '@{replace(variables('d'), '''', '''''')}'::date")).toBe('WHERE d <= ${{ sql(vars.d) }}::date'));
it('leaves the replace() alone when it is not quoted', () =>
    expect(decompileTemplate("x @{replace(variables('d'), '''', '''''')} y")).toBe("x ${{ replace(vars.d, '''', '''''') }} y"));
it('rejects an interpolation no ${{ }} can hold', () => expect(decompileTemplate(`a @{json('{"b":{}}')}`)).toBeUndefined());
it('rejects an unterminated interpolation', () => expect(decompileTemplate('a @{b')).toBeUndefined());
