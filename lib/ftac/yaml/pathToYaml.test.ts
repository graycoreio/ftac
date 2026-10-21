import { expect, it } from 'vitest';
import { pathToYaml } from './pathToYaml.ts';

const slot = (value: string) => ({ value, type: 'Expression' });

it('keeps a plain string plain', () => expect(pathToYaml('Sales/Orders')).toBe('Sales/Orders'));
it('reads an expression slot back as ${{ }}', () => expect(pathToYaml(slot('@item().table_name'))).toBe('${{ item.table_name }}'));
it('reads an interpolated slot back as a mix', () => expect(pathToYaml(slot("Sales/@{variables('p')}"))).toBe('Sales/${{ vars.p }}'));
it('rejects a text slot, which a path only compiles to with a ${{ }}', () => expect(pathToYaml(slot('Sales/Orders'))).toBeUndefined());
it('rejects a plain string with ${{ in it', () => expect(pathToYaml('a ${{ b }}')).toBeUndefined());
it('rejects anything else', () => expect(pathToYaml(3)).toBeUndefined());
