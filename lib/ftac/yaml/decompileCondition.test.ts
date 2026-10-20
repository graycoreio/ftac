import { expect, it } from 'vitest';
import { decompileCondition } from './decompileCondition.ts';

it('makes the source a lone ${{ }}', () =>
    expect(decompileCondition("greater(activity('load').output.rowsCopied, 0)")).toBe('${{ greater(steps.load.outputs.rowsCopied, 0) }}'));
it('reads for-each items back', () => expect(decompileCondition("activity('l').output.value")).toBe('${{ steps.l.outputs.value }}'));
it('rejects source no ${{ }} can hold', () => expect(decompileCondition(`equals(json('{"a":{}}'), 1)`)).toBeUndefined());
