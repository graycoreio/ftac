import { expect, it } from 'vitest';
import { policy } from '../../activities/policy.ts';
import { compileStep } from '../compileStep.ts';
import { stepToYaml } from '../stepToYaml.ts';
import type { Context, YamlStep } from '../types.ts';
import { compileExample } from './compileExample.ts';
import { copyAction as a } from './copy.ts';

it('example compiles to a Copy with the bound query, the csv sink, and the step policy', () => {
    const act = compileExample(a) as any;
    expect(act.type).toBe('Copy');
    expect(act.policy).toEqual(policy({ timeout: '0.01:00:00', retry: 1, retryIntervalInSeconds: 300 }));
    expect(act.typeProperties.source.datasetSettings.externalReferences.connection).toBe('00000000-0000-0000-0000-000000000000');
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

it('reads a Copy back with its datasets, translator and staging', () => {
    const datasets = { t: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'T' } } };
    const written: YamlStep = { id: 'c', uses: 'fabric/copy', with: { source: { table: 't' }, sink: { table: 't', action: 'Append' }, translator: 'tabular', staging: true } };
    const ctx: Context = { env: {}, datasets: {} };
    expect(stepToYaml(compileStep(written, { env: {}, datasets }), ctx)).toEqual({
        step: { ...written, with: { ...written.with, source: { table: 'T' }, sink: { table: 'T', action: 'Append' } } },
        raw: [],
        notes: [],
        total: 1,
    });
    expect(ctx.datasets).toEqual({ T: datasets.t });
});
it('keeps a source and sink it does not know as raw: inside fabric/copy', () => {
    const ctx: Context = { env: {}, datasets: {} };
    const w = { source: { raw: { type: 'SqlServerSource' } }, sink: { raw: { type: 'ParquetSink' } } };
    const d = stepToYaml(compileStep({ id: 'c', uses: 'fabric/copy', with: w }, ctx), ctx);
    expect(d.step.with).toEqual(w);
    expect(d.raw).toEqual([]);
    expect(d.notes).toEqual(['c: source kept as raw: JSON', 'c: sink kept as raw: JSON']);
});
it('stays raw with a translator other than the tabular default', () => {
    const ctx: Context = { env: {}, datasets: {} };
    const act = compileStep({ id: 'c', uses: 'fabric/copy', with: { source: { raw: {} }, sink: { raw: {} } } }, ctx);
    const d = stepToYaml({ ...act, typeProperties: { ...act.typeProperties, translator: { type: 'TabularTranslator', mappings: [] } } }, ctx);
    expect(d.raw).toEqual(['c']);
    expect(d.notes).toEqual(['c: fabric/copy: its translator is not the tabular default']);
});
