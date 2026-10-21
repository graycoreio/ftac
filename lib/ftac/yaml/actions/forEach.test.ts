import { expect, it } from 'vitest';
import { compileStep } from '../compileStep.ts';
import { stepToYaml } from '../stepToYaml.ts';
import type { YamlStep } from '../types.ts';
import { compileExample } from './compileExample.ts';
import { forEachAction as a } from './forEach.ts';

it('example compiles to a ForEach whose nested Copy reads the item', () => {
    const act = compileExample(a) as any;
    expect(act.type).toBe('ForEach');
    expect(act.typeProperties).toMatchObject({ batchCount: 4, items: { value: "@activity('list_tables').output.value" } });
    const inner = act.typeProperties.activities[0];
    expect(inner.name).toBe('load_table');
    expect(inner.typeProperties.source.datasetSettings.typeProperties.table).toEqual({ value: '@item().table_name', type: 'Expression' });
    expect(inner.typeProperties.sink.datasetSettings.typeProperties.table).toEqual({ value: '@item().table_name', type: 'Expression' });
});
it('requires nested steps and takes no policy', () => {
    expect(a.steps).toBe('required');
    expect(a.policy).toBe(false);
});

const ctx = { env: {}, datasets: {} };
const roundTrip = (step: YamlStep) => stepToYaml(compileStep(step, ctx), ctx);

it('reads a ForEach back with its options and nested steps', () => {
    const step: YamlStep = {
        id: 'each',
        uses: 'fabric/for-each',
        with: { items: '${{ steps.list.outputs.value }}', batch: 4, sequential: true },
        steps: [{ id: 'w', uses: 'fabric/wait', with: { seconds: 1 } }],
    };
    expect(roundTrip(step)).toEqual({ step, raw: [], notes: [], total: 2 });
});
it('stays raw when the export spells out isSequential: false, which the compiler leaves out', () => {
    const act = compileStep({ id: 'each', uses: 'fabric/for-each', with: { items: '${{ inputs.list }}' }, steps: [] }, ctx);
    expect(stepToYaml({ ...act, typeProperties: { ...act.typeProperties, isSequential: false } }, ctx).raw).toEqual(['each']);
});
