import { expect, it } from 'vitest';
import { policy } from '../activities/policy.ts';
import { compilePolicy } from './compilePolicy.ts';
import { policyToYaml } from './policyToYaml.ts';

it('writes nothing for the default policy', () => expect(policyToYaml(policy())).toEqual({}));
it('writes a timeout under a day as HH:MM:SS', () => expect(policyToYaml(policy({ timeout: '0.01:00:00' }))).toEqual({ timeout: '01:00:00' }));
it('keeps the day of a longer timeout', () => expect(policyToYaml(policy({ timeout: '1.02:00:00' }))).toEqual({ timeout: '1.02:00:00' }));
it('writes only the retry settings that differ', () => {
    expect(policyToYaml(policy({ retry: 2 }))).toEqual({ retry: { count: 2 } });
    expect(policyToYaml(policy({ retry: 1, retryIntervalInSeconds: 300 }))).toEqual({ retry: { count: 1, interval: 300 } });
});
it('rejects a missing or secured policy', () => {
    expect(policyToYaml(undefined)).toBeUndefined();
    expect(policyToYaml(policy({ secureOutput: true }))).toBeUndefined();
});
it('compiles back to the same policy', () => {
    const p = policy({ timeout: '0.01:00:00', retry: 1, retryIntervalInSeconds: 300 });
    expect(compilePolicy({ id: 'x', ...policyToYaml(p) })).toEqual(p);
});
