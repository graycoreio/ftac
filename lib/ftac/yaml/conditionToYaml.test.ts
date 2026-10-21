import { expect, it } from 'vitest';
import { conditionToYaml } from './conditionToYaml.ts';

it('makes the source a lone ${{ }}', () =>
    expect(conditionToYaml("greater(activity('load').output.rowsCopied, 0)")).toBe('${{ greater(steps.load.outputs.rowsCopied, 0) }}'));
it('reads for-each items back', () => expect(conditionToYaml("activity('l').output.value")).toBe('${{ steps.l.outputs.value }}'));
it('rejects source no ${{ }} can hold', () => expect(conditionToYaml(`equals(json('{"a":{}}'), 1)`)).toBeUndefined());
