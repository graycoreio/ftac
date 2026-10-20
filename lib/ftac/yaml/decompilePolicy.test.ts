import { expect, it } from 'vitest';
import { policy } from '../activities/policy.ts';
import { compilePolicy } from './compilePolicy.ts';
import { decompilePolicy } from './decompilePolicy.ts';

it('writes nothing for the default policy', () => expect(decompilePolicy(policy())).toEqual({}));
it('writes a timeout under a day as HH:MM:SS', () => expect(decompilePolicy(policy({ timeout: '0.01:00:00' }))).toEqual({ timeout: '01:00:00' }));
it('keeps the day of a longer timeout', () => expect(decompilePolicy(policy({ timeout: '1.02:00:00' }))).toEqual({ timeout: '1.02:00:00' }));
it('writes only the retry settings that differ', () => {
    expect(decompilePolicy(policy({ retry: 2 }))).toEqual({ retry: { count: 2 } });
    expect(decompilePolicy(policy({ retry: 1, retryIntervalInSeconds: 300 }))).toEqual({ retry: { count: 1, interval: 300 } });
});
it('rejects a missing or secured policy', () => {
    expect(decompilePolicy(undefined)).toBeUndefined();
    expect(decompilePolicy(policy({ secureOutput: true }))).toBeUndefined();
});
it('compiles back to the same policy', () => {
    const p = policy({ timeout: '0.01:00:00', retry: 1, retryIntervalInSeconds: 300 });
    expect(compilePolicy({ id: 'x', ...decompilePolicy(p) })).toEqual(p);
});
