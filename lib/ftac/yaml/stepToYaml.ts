import type { Activity } from '../types.ts';
import { registry } from './actions/registry.ts';
import type { ToYamlArgs, ToYamlBody } from './actions/types.ts';
import { compileStep } from './compileStep.ts';
import { ifGroupToYaml } from './ifGroupToYaml.ts';
import { labelsToYaml } from './labelsToYaml.ts';
import { needsToYaml } from './needsToYaml.ts';
import { policyToYaml } from './policyToYaml.ts';
import { firstDifference } from './firstDifference.ts';
import type { Context, YamlStep } from './types.ts';

/** Something that reads an activity back: an action, or the if: group. `policy: false` when it takes no timeout:/retry:. */
type Reader = { name: string; toYaml?: (args: ToYamlArgs) => ToYamlBody | undefined; policy?: boolean };

const READERS: Reader[] = [{ name: 'if: group', toYaml: ifGroupToYaml, policy: false }, ...registry.values()];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * The step a reader makes of the activity, keys in the order a hand-written
 * step has them, when it compiles back to exactly the activity. Otherwise
 * why not, or no reason when the activity isn't the reader's kind at all.
 * A nested activity that can't be read back fails the whole step.
 * Datasets it names land in ctx only when it succeeds.
 */
function attempt(reader: Reader, activity: Activity, ctx: Context): { step: YamlStep } | { reason?: string } {
    const local: Context = { env: ctx.env, datasets: { ...ctx.datasets } };
    let nested: unknown;
    const steps = (activities: Activity[]) =>
        activities.map((a) => {
            try {
                return stepToYaml(a, local);
            } catch (e) {
                throw (nested = e);
            }
        });
    let body: ToYamlBody | undefined;
    try {
        body = reader.toYaml?.({ activity, ctx: local, steps });
    } catch (e) {
        if (nested !== undefined) throw nested;
        return { reason: `${reader.name}: ${message(e)}` };
    }
    if (!body) return {};
    const policy = reader.policy === false ? {} : policyToYaml(activity.policy);
    if (!policy) return { reason: `${reader.name}: its policy has settings timeout: and retry: cannot express` };
    const labels = labelsToYaml(activity.userProperties);
    if (!labels) return { reason: `${reader.name}: its userProperties cannot be written as labels:` };
    const { uses, if: condition, with: w, steps: children, ...rest } = body;
    const needs = needsToYaml(activity.dependsOn);
    const step: YamlStep = {
        id: activity.name,
        ...(needs !== undefined && { needs }),
        ...(uses !== undefined && { uses }),
        ...(condition !== undefined && { if: condition }),
        ...policy,
        ...(w !== undefined && { with: w }),
        ...rest,
        ...(children !== undefined && { steps: children }),
        ...(Object.keys(labels).length && { labels }),
    };
    let diff: string | undefined;
    try {
        diff = firstDifference(compileStep(step, local), activity);
    } catch (e) {
        return { reason: `${reader.name}: the step does not compile: ${message(e)}` };
    }
    if (diff !== undefined) return { reason: `${reader.name} differs at ${diff || 'the root'}` };
    Object.assign(ctx.datasets, local.datasets);
    return { step };
}

/**
 * One activity as one step: the inverse of compileStep. The if: group and
 * each action that can read its JSON back are tried in turn; when none
 * reproduces the activity exactly, it throws with the first reason a reader
 * gave.
 */
export function stepToYaml(activity: Activity, ctx: Context): YamlStep {
    let reason: string | undefined;
    for (const reader of READERS) {
        const d = attempt(reader, activity, ctx);
        if ('step' in d) return d.step;
        reason ??= d.reason;
    }
    throw new Error(`${activity.name ?? '(unnamed activity)'}: cannot be written as YAML: ${reason ?? `no built-in action reads a ${activity.type} activity`}`);
}
