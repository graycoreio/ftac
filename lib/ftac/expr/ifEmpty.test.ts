import { expect, it } from 'vitest';
import { ifEmpty } from './ifEmpty.ts';

it('falls back when the test is empty', () =>
    expect(ifEmpty('pipeline().parameters.p', "'x'")).toBe("if(empty(pipeline().parameters.p), 'x', pipeline().parameters.p)"));
