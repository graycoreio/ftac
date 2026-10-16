import type { Policy } from '../types.ts';

/** The policy every portal-built activity carries. */
export const DEFAULT_POLICY: Policy = {
    timeout: '0.12:00:00',
    retry: 0,
    retryIntervalInSeconds: 30,
    secureInput: false,
    secureOutput: false,
};

/** The default policy with overrides; key order is preserved. */
export const policy = (overrides: Partial<Policy> = {}): Policy => ({ ...DEFAULT_POLICY, ...overrides });
