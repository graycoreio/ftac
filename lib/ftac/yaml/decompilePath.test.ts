import { expect, it } from 'vitest';
import { decompilePath } from './decompilePath.ts';

const slot = (value: string) => ({ value, type: 'Expression' });

it('keeps a plain string plain', () => expect(decompilePath('Sales/Orders')).toBe('Sales/Orders'));
it('reads an expression slot back as ${{ }}', () => expect(decompilePath(slot('@item().table_name'))).toBe('${{ item.table_name }}'));
it('reads an interpolated slot back as a mix', () => expect(decompilePath(slot("Sales/@{variables('p')}"))).toBe('Sales/${{ vars.p }}'));
it('rejects a text slot, which a path only compiles to with a ${{ }}', () => expect(decompilePath(slot('Sales/Orders'))).toBeUndefined());
it('rejects a plain string with ${{ in it', () => expect(decompilePath('a ${{ b }}')).toBeUndefined());
it('rejects anything else', () => expect(decompilePath(3)).toBeUndefined());
