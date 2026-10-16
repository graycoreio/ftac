import { expect, it } from 'vitest';
import { fail } from './fail.ts';

it('fails with an expression message and a code', () =>
    expect(fail('f', { message: "concat('a', 'b')", errorCode: 'Empty' }).typeProperties).toEqual({
        message: { value: "@concat('a', 'b')", type: 'Expression' },
        errorCode: 'Empty',
    }));
