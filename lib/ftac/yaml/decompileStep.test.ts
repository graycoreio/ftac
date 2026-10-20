import { expect, it } from 'vitest';
import { ifCondition } from '../activities/ifCondition.ts';
import { wait } from '../activities/wait.ts';
import { expr } from '../expr/expr.ts';
import type { Activity } from '../types.ts';
import { compileStep } from './compileStep.ts';
import { decompileStep } from './decompileStep.ts';

const ctx = { env: {}, datasets: {} };
const web: Activity = { type: 'WebActivity', typeProperties: { method: 'GET' }, name: 'call', dependsOn: [{ activity: 'a', dependencyConditions: ['Failed'] }] };

it('keeps an activity no action reads back as fabric/raw, with needs', () =>
    expect(decompileStep(web, ctx)).toEqual({
        raw: ['call'],
        notes: ['call: no built-in action reads a WebActivity activity'],
        total: 1,
        step: { id: 'call', needs: { step: 'a', on: 'failed' }, uses: 'fabric/raw', with: { type: 'WebActivity', typeProperties: { method: 'GET' } } },
    }));
it('reads an activity an action knows back as that action', () =>
    expect(decompileStep(wait('settle', 1, { needs: 'load' }), ctx)).toEqual({
        raw: [],
        notes: [],
        total: 1,
        step: { id: 'settle', needs: 'load', uses: 'fabric/wait', with: { seconds: 1 } },
    }));
it('reads userProperties back as labels', () =>
    expect(decompileStep({ ...wait('w', 1), userProperties: [{ name: 'report', value: expr('item().name') }] }, ctx).step).toEqual({
        id: 'w',
        uses: 'fabric/wait',
        with: { seconds: 1 },
        labels: { report: '${{ item.name }}' },
    }));
it('reads an IfCondition back as an if: group, counting the steps inside', () => {
    const a = ifCondition('g', "equals(variables('b'), 1)", { then: [wait('w', 1), web] }, { needs: 'x' });
    const d = decompileStep(a, ctx);
    expect(d.raw).toEqual(['call']);
    expect(d.total).toBe(3);
    expect(d.step).toMatchObject({ id: 'g', needs: 'x', if: '${{ equals(vars.b, 1) }}', steps: [{ id: 'w', uses: 'fabric/wait' }, { id: 'call', uses: 'fabric/raw' }] });
    expect(Object.keys(d.step)).toEqual(['id', 'needs', 'if', 'steps']);
});
it('keeps an IfCondition with an else branch raw', () =>
    expect(decompileStep(ifCondition('g', 'true', { then: [wait('a', 1)], else: [wait('b', 1)] }), ctx).raw).toEqual(['g']));
it('keeps raw what YAML cannot label, and still compiles back to it', () => {
    const a: Activity = { ...wait('w', 1), userProperties: [{ name: 'k', value: 'plain' }] };
    const d = decompileStep(a, ctx);
    expect(d.raw).toEqual(['w']);
    expect(compileStep(d.step, ctx)).toEqual(a);
});
it('adds datasets to the context only for a step that compiles back', () => {
    const datasets = { f: { csv: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'in.csv' } } };
    const act = compileStep({ id: 'g', uses: 'fabric/get-metadata', with: { dataset: 'f' } }, { env: {}, datasets });
    const ok = { env: {}, datasets: {} };
    decompileStep(act, ok);
    expect(Object.keys(ok.datasets)).toEqual(['in']);
    // A field no reader writes sends it to raw, and the dataset get-metadata named goes with it.
    const bad = { env: {}, datasets: {} };
    expect(decompileStep({ ...act, typeProperties: { ...act.typeProperties, extra: 1 } }, bad).raw).toEqual(['g']);
    expect(bad.datasets).toEqual({});
});
it('notes why an activity an action knows stayed raw', () => {
    expect(decompileStep(ifCondition('g', 'true', { then: [wait('a', 1)], else: [wait('b', 1)] }), ctx).notes).toEqual([
        'g: if: group: it has an else branch, which an if: group cannot hold',
    ]);
    const extra = { ...wait('w', 1), typeProperties: { waitTimeInSeconds: 1, extra: true } };
    expect(decompileStep(extra, ctx).notes).toEqual(['w: fabric/wait differs at typeProperties.extra']);
    expect(decompileStep({ ...wait('w', 1), policy: { secureInput: true } as never }, ctx).notes).toEqual([
        'w: fabric/wait differs at policy',
    ]);
});
it('passes notes up from nested steps', () =>
    expect(decompileStep(ifCondition('g', 'true', { then: [web] }), ctx).notes).toEqual(['call: no built-in action reads a WebActivity activity']));
it('rejects an activity that cannot survive the round trip', () =>
    expect(() => decompileStep({ type: 'Wait', typeProperties: {}, dependsOn: [] } as unknown as Activity, ctx)).toThrow(/\(unnamed activity\): does not compile back/));
