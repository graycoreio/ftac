import { DEFAULT_POLICY } from '../activities/policy.ts';
import type { Policy } from '../types.ts';
import type { YamlStep } from './types.ts';

/**
 * An activity policy as `timeout:` and `retry:`: the inverse of
 * compilePolicy. Only what differs from the portal default is written.
 * Undefined when there is no policy, or it secures input or output, which
 * YAML has no key for.
 */
export function policyToYaml(policy: Policy | undefined): Pick<YamlStep, 'timeout' | 'retry'> | undefined {
    if (!policy || policy.secureInput !== false || policy.secureOutput !== false) return undefined;
    const out: Pick<YamlStep, 'timeout' | 'retry'> = {};
    if (policy.timeout !== undefined && policy.timeout !== DEFAULT_POLICY.timeout) out.timeout = policy.timeout.replace(/^0\./, '');
    const count = policy.retry !== DEFAULT_POLICY.retry ? policy.retry : undefined;
    const interval = policy.retryIntervalInSeconds !== DEFAULT_POLICY.retryIntervalInSeconds ? policy.retryIntervalInSeconds : undefined;
    if (count !== undefined || interval !== undefined) out.retry = { ...(count !== undefined && { count }), ...(interval !== undefined && { interval }) };
    return out;
}
