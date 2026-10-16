import { expect, it } from 'vitest';
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
