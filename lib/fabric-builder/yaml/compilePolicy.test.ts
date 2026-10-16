import { expect, it } from 'vitest';
import { DEFAULT_POLICY } from '../activities/policy.ts';
import { compilePolicy } from './compilePolicy.ts';

it('defaults to the portal policy', () => expect(compilePolicy({ id: 's' })).toEqual(DEFAULT_POLICY));
it('prefixes a HH:MM:SS timeout with days and applies retry', () =>
    expect(compilePolicy({ id: 's', timeout: '01:00:00', retry: { count: 1, interval: 300 } })).toEqual({
        timeout: '0.01:00:00',
        retry: 1,
        retryIntervalInSeconds: 300,
        secureInput: false,
        secureOutput: false,
    }));
it('keeps a D.HH:MM:SS timeout', () => expect(compilePolicy({ id: 's', timeout: '1.00:00:00' }).timeout).toBe('1.00:00:00'));
it('rejects other timeout formats', () => expect(() => compilePolicy({ id: 's', timeout: '1h' })).toThrow(/timeout/));
