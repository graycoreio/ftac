import { ifCondition } from '../activities/ifCondition.ts';
import type { Activity } from '../types.ts';
import { registry } from './actions/registry.ts';
import { compileCondition } from './compileCondition.ts';
import { compileNeeds } from './compileNeeds.ts';
import { compilePolicy } from './compilePolicy.ts';
import { compileSlot } from './compileSlot.ts';
import { compileSteps } from './compileSteps.ts';
import type { Context, YamlStep } from './types.ts';

const KNOWN = new Set(['id', 'description', 'uses', 'with', 'needs', 'if', 'steps', 'timeout', 'retry', 'labels']);

/** `labels:` as userProperties: name -> text or ${{ }}, shown per run in monitoring. */
const compileLabels = (labels: Record<string, string> | undefined, ctx: Context) =>
    Object.entries(labels ?? {}).map(([name, value]) => ({ name, value: compileSlot(String(value), ctx) }));

/** `description:` after the name, where Fabric exports it. */
const describe = (a: Activity, description: string | undefined): Activity =>
    description === undefined ? a : (Object.fromEntries(Object.entries(a).flatMap(([k, v]) => (k === 'name' ? [[k, v], ['description', description]] : [[k, v]]))) as Activity);

/**
 * One step as one activity. `if:` + `steps:` is a container; otherwise
 * `uses:` names an action from the registry (see actions/registry.ts).
 * `description:` and `labels:` go on either, the latter as userProperties.
 */
export function compileStep(step: YamlStep, ctx: Context): Activity {
    const id = step.id;
    if (!id) throw new Error('every step needs an id');
    for (const k of Object.keys(step)) if (!KNOWN.has(k)) throw new Error(`${id}: unknown key '${k}'`);
    const needs = compileNeeds(step.needs);
    const timed = step.timeout !== undefined || step.retry !== undefined;

    if (step.if !== undefined) {
        if (!step.steps) throw new Error(`${id}: a step with if: must have nested steps: (a lone activity can't be conditional in Fabric)`);
        if (step.uses || timed) throw new Error(`${id}: an if: group takes no uses:, timeout:, or retry:`);
        return describe(ifCondition(id, compileCondition(step.if, ctx), { then: compileSteps(step.steps, ctx) }, { needs, userProperties: compileLabels(step.labels, ctx) }), step.description);
    }

    if (!step.uses) throw new Error(`${id}: a step needs uses: or if:`);
    const action = registry.get(step.uses);
    if (!action) throw new Error(`${id}: unknown uses: '${step.uses}'. Built-in actions: ${[...registry.keys()].join(', ')}`);
    if (action.steps === 'required' && !step.steps) throw new Error(`${id}: ${action.name} needs nested steps:`);
    if (action.steps !== 'required' && step.steps) throw new Error(`${id}: ${action.name} takes no nested steps:`);
    if (action.policy === false && timed) throw new Error(`${id}: ${action.name} has no timeout: or retry:`);

    const a = action.compile({ step, ctx, needs, policy: compilePolicy(step), with: (step.with ?? {}) as Record<string, any> });
    const userProperties = compileLabels(step.labels, ctx);
    return describe(userProperties.length ? { ...a, userProperties } : a, step.description);
}
