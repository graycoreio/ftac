import { expect, it } from 'vitest';
import { ifCondition } from '../activities/ifCondition.ts';
import { wait } from '../activities/wait.ts';
import { expr } from '../expr/expr.ts';
import type { Activity } from '../types.ts';
import { compileStep } from './compileStep.ts';
import { stepToYaml } from './stepToYaml.ts';

const ctx = { env: {}, datasets: {} };
const web: Activity = { type: 'WebActivity', typeProperties: { method: 'GET' }, name: 'call', dependsOn: [{ activity: 'a', dependencyConditions: ['Failed'] }] };

it('rejects an activity no action reads back', () => expect(() => stepToYaml(web, ctx)).toThrow('call: cannot be written as YAML: no built-in action reads a WebActivity activity'));
it('reads an activity an action knows back as that action', () =>
    expect(stepToYaml(wait('settle', 1, { needs: 'load' }), ctx)).toEqual({ id: 'settle', needs: 'load', uses: 'fabric/wait', with: { seconds: 1 } }));
it('reads userProperties back as labels', () =>
    expect(stepToYaml({ ...wait('w', 1), userProperties: [{ name: 'report', value: expr('item().name') }] }, ctx)).toEqual({
        id: 'w',
        uses: 'fabric/wait',
        with: { seconds: 1 },
        labels: { report: '${{ item.name }}' },
    }));
it('reads an IfCondition back as an if: group', () => {
    const a = ifCondition('g', "equals(variables('b'), 1)", { then: [wait('w', 1)] }, { needs: 'x' });
    const step = stepToYaml(a, ctx);
    expect(step).toMatchObject({ id: 'g', needs: 'x', if: '${{ equals(vars.b, 1) }}', steps: [{ id: 'w', uses: 'fabric/wait' }] });
    expect(Object.keys(step)).toEqual(['id', 'needs', 'if', 'steps']);
});
it('rejects userProperties YAML cannot label', () =>
    expect(() => stepToYaml({ ...wait('w', 1), userProperties: [{ name: 'k', value: 'plain' }] }, ctx)).toThrow(
        'w: cannot be written as YAML: fabric/wait: its userProperties cannot be written as labels:'
    ));
it('adds datasets to the context only for a step that compiles back', () => {
    const datasets = { f: { csv: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'in.csv' } } };
    const act = compileStep({ id: 'g', uses: 'fabric/get-metadata', with: { dataset: 'f' } }, { env: {}, datasets });
    const ok = { env: {}, datasets: {} };
    stepToYaml(act, ok);
    expect(Object.keys(ok.datasets)).toEqual(['in']);
    // A field no reader writes fails the step, and the dataset get-metadata named is not added.
    const bad = { env: {}, datasets: {} };
    expect(() => stepToYaml({ ...act, typeProperties: { ...act.typeProperties, extra: 1 } }, bad)).toThrow(/differs at typeProperties.extra/);
    expect(bad.datasets).toEqual({});
});
it('says why an activity an action knows cannot be read back', () => {
    expect(() => stepToYaml(ifCondition('g', 'true', { then: [wait('a', 1)], else: [wait('b', 1)] }), ctx)).toThrow(
        'g: cannot be written as YAML: if: group: it has an else branch, which an if: group cannot hold'
    );
    const extra = { ...wait('w', 1), typeProperties: { waitTimeInSeconds: 1, extra: true } };
    expect(() => stepToYaml(extra, ctx)).toThrow('w: cannot be written as YAML: fabric/wait differs at typeProperties.extra');
    expect(() => stepToYaml({ ...wait('w', 1), policy: { secureInput: true } as never }, ctx)).toThrow('w: cannot be written as YAML: fabric/wait differs at policy');
});
it('rejects a step with a nested activity no action reads back, naming the nested one', () =>
    expect(() => stepToYaml(ifCondition('g', 'true', { then: [wait('w', 1), web] }), ctx)).toThrow(
        /^call: cannot be written as YAML: no built-in action reads a WebActivity activity$/
    ));
it('rejects an unnamed activity', () =>
    expect(() => stepToYaml({ type: 'Wait', typeProperties: {}, dependsOn: [] } as unknown as Activity, ctx)).toThrow(/^\(unnamed activity\): cannot be written as YAML/));
