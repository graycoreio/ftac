import { expect, it } from 'vitest';
import { templateToYaml } from './templateToYaml.ts';

it('keeps text without interpolations', () => expect(templateToYaml('Sales/Orders')).toBe('Sales/Orders'));
it('turns interpolations into ${{ }}', () => expect(templateToYaml("a/@{variables('p')}/b")).toBe('a/${{ vars.p }}/b'));
it('turns a quoted, escaped interpolation into sql()', () =>
    expect(templateToYaml("WHERE d <= '@{replace(variables('d'), '''', '''''')}'::date")).toBe('WHERE d <= ${{ sql(vars.d) }}::date'));
it('leaves the replace() alone when it is not quoted', () =>
    expect(templateToYaml("x @{replace(variables('d'), '''', '''''')} y")).toBe("x ${{ replace(vars.d, '''', '''''') }} y"));
it('rejects an interpolation no ${{ }} can hold', () => expect(templateToYaml(`a @{json('{"b":{}}')}`)).toBeUndefined());
it('rejects an unterminated interpolation', () => expect(templateToYaml('a @{b')).toBeUndefined());
