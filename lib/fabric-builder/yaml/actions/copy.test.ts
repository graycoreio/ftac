import { expect, it } from 'vitest';
import { policy } from '../../activities/policy.ts';
import { compileExample } from './compileExample.ts';
import { copyAction as a } from './copy.ts';

it('example compiles to a Copy with the bound query, the csv sink, and the step policy', () => {
    const act = compileExample(a) as any;
    expect(act.type).toBe('Copy');
    expect(act.policy).toEqual(policy({ timeout: '0.01:00:00', retry: 1, retryIntervalInSeconds: 300 }));
    expect(act.typeProperties.source.datasetSettings.externalReferences.connection).toBe('7c5329e4-58a9-4317-9d4d-63460450abe9');
    expect(act.typeProperties.source.query.value).toBe("SELECT * FROM t WHERE d <= '@{replace(variables('date'), '''', '''''')}'::date");
    expect(act.typeProperties.sink.type).toBe('DelimitedTextSink');
    expect(act.typeProperties.enableStaging).toBe(false);
    expect(act.typeProperties.translator).toBeUndefined();
});
it('adds the tabular translator on request', () => {
    const ctx = { env: {}, datasets: { t: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'T' } } } };
    const act = a.compile({ step: { id: 'c' }, ctx, needs: [], policy: policy(), with: { source: { table: 't' }, sink: { table: 't' }, translator: 'tabular' } });
    expect(act.typeProperties.translator).toMatchObject({ type: 'TabularTranslator' });
});
it('rejects a step without source or sink', () =>
    expect(() => a.compile({ step: { id: 'c' }, ctx: { env: {}, datasets: {} }, needs: [], policy: policy(), with: {} })).toThrow(/source must be/));
