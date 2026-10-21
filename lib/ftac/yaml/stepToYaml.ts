import type { Activity } from '../types.ts';
import { rawAction } from './actions/raw.ts';
import { registry } from './actions/registry.ts';
import type { ToYamlArgs, ToYamlBody } from './actions/types.ts';
import { compileStep } from './compileStep.ts';
import { ifGroupToYaml } from './ifGroupToYaml.ts';
import { labelsToYaml } from './labelsToYaml.ts';
import { needsToYaml } from './needsToYaml.ts';
import { policyToYaml } from './policyToYaml.ts';
import { firstDifference } from './firstDifference.ts';
import type { Context, YamlStep } from './types.ts';

/**
 * A step, with the ids of the steps in it (itself included) kept as
 * fabric/raw, how many activities it holds, and notes: one line per raw
 * step saying why, and one per with: field kept as raw: JSON.
 */
export type ToYamlStep = { step: YamlStep; raw: string[]; notes: string[]; total: number };

/** Something that reads an activity back: an action, or the if: group. `policy: false` when it takes no timeout:/retry:. */
type Reader = { name: string; toYaml?: (args: ToYamlArgs) => ToYamlBody | undefined; policy?: boolean };

const READERS: Reader[] = [{ name: 'if: group', toYaml: ifGroupToYaml, policy: false }, ...[...registry.values()].filter((a) => a !== rawAction)];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * The step a reader makes of the activity, keys in the order a hand-written
 * step has them, when it compiles back to exactly the activity. Otherwise
 * why not, or no reason when the activity isn't the reader's kind at all.
 * Datasets it names land in ctx only when it succeeds.
 */
function attempt(reader: Reader, activity: Activity, ctx: Context): ToYamlStep | { reason?: string } {
    const local: Context = { env: ctx.env, datasets: { ...ctx.datasets } };
    const raw: string[] = [];
    const notes: string[] = [];
    let total = 1;
    const steps = (activities: Activity[]) =>
        activities.map((a) => {
            const d = stepToYaml(a, local);
            raw.push(...d.raw);
            notes.push(...d.notes);
            total += d.total;
            return d.step;
        });
    let body: ToYamlBody | undefined;
    try {
        body = reader.toYaml?.({ activity, ctx: local, steps });
    } catch (e) {
        return { reason: `${reader.name}: ${message(e)}` };
    }
    if (!body) return {};
    const policy = reader.policy === false ? {} : policyToYaml(activity.policy);
    if (!policy) return { reason: `${reader.name}: its policy has settings timeout: and retry: cannot express` };
    const labels = labelsToYaml(activity.userProperties);
    if (!labels) return { reason: `${reader.name}: its userProperties cannot be written as labels:` };
    const { uses, if: condition, with: w, steps: nested, rawParts = [], ...rest } = body;
    const needs = needsToYaml(activity.dependsOn);
    const step: YamlStep = {
        id: activity.name,
        ...(needs !== undefined && { needs }),
        ...(uses !== undefined && { uses }),
        ...(condition !== undefined && { if: condition }),
        ...policy,
        ...(w !== undefined && { with: w }),
        ...rest,
        ...(nested !== undefined && { steps: nested }),
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
    return { step, raw, notes: [...rawParts.map((p) => `${activity.name}: ${p} kept as raw: JSON`), ...notes], total };
}

/**
 * One activity as one step: the inverse of compileStep. The if: group and
 * each action that can read its JSON back are tried in turn; when none
 * reproduces the activity exactly, it is kept verbatim as a fabric/raw step,
 * noted with the first reason a reader gave.
 */
export function stepToYaml(activity: Activity, ctx: Context): ToYamlStep {
    let reason: string | undefined;
    for (const reader of READERS) {
        const d = attempt(reader, activity, ctx);
        if ('step' in d) return d;
        reason ??= d.reason;
    }
    const step = rawStep(activity, ctx);
    if (!step) throw new Error(`${activity.name ?? '(unnamed activity)'}: does not compile back to the same activity, even as fabric/raw`);
    return { step, raw: [activity.name], notes: [`${activity.name}: ${reason ?? `no built-in action reads a ${activity.type} activity`}`], total: 1 };
}

/** The activity as a fabric/raw step, policy and userProperties left inside with:; undefined when even that does not compile back to it. */
function rawStep(activity: Activity, ctx: Context): YamlStep | undefined {
    try {
        const { uses, with: w } = rawAction.toYaml!({ activity, ctx, steps: () => [] })!;
        const needs = needsToYaml(activity.dependsOn);
        const step: YamlStep = { id: activity.name, ...(needs !== undefined && { needs }), uses, with: w };
        return firstDifference(compileStep(step, ctx), activity) === undefined ? step : undefined;
    } catch {
        return undefined;
    }
}
