import type { Activity, ActivityOptions } from '../types.ts';
import { dependsOn } from './dependsOn.ts';

/** The envelope every activity shares, keys in the order Fabric exports them. */
export function activity(type: string, name: string, typeProperties: Record<string, unknown>, opts: ActivityOptions = {}): Activity {
    const a: Activity = { type, typeProperties } as Activity;
    if (opts.linkedService) a.linkedService = opts.linkedService;
    if (opts.externalReferences) a.externalReferences = opts.externalReferences;
    if (opts.policy) a.policy = opts.policy;
    a.name = name;
    a.dependsOn = dependsOn(opts.needs);
    if (opts.userProperties?.length) a.userProperties = opts.userProperties;
    return a;
}
