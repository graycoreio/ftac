import { expect, it } from 'vitest';
import { DEFAULT_POLICY, policy } from './policy.ts';

it('defaults to the portal policy', () => expect(policy()).toEqual(DEFAULT_POLICY));
it('overrides while keeping key order', () =>
    expect(Object.entries(policy({ retry: 2 }))).toEqual([
        ['timeout', '0.12:00:00'],
        ['retry', 2],
        ['retryIntervalInSeconds', 30],
        ['secureInput', false],
        ['secureOutput', false],
    ]));
