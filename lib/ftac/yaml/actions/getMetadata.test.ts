import { expect, it } from 'vitest';
import { compileStep } from '../compileStep.ts';
import { stepToYaml } from '../stepToYaml.ts';
import type { Context } from '../types.ts';
import { compileExample } from './compileExample.ts';
import { getMetadataAction as a } from './getMetadata.ts';

it('example compiles to a GetMetadata on the named dataset', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'GetMetadata',
        name: 'check_file',
        typeProperties: { fieldList: ['exists'], datasetSettings: { type: 'DelimitedText', typeProperties: { location: { fileName: 'orders.csv' } } } },
    }));
it('rejects an unknown dataset', () =>
    expect(() => a.compile({ step: { id: 'g' }, ctx: { env: {}, datasets: {} }, needs: [], policy: {} as never, with: { dataset: 'nope' } })).toThrow(/not defined/));

it('reads a GetMetadata back, fields only when not [exists]', () => {
    const datasets = { f: { csv: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'in.csv' } } };
    const ctx: Context = { env: {}, datasets: {} };
    const act = compileStep({ id: 'g', uses: 'fabric/get-metadata', with: { dataset: 'f', fields: ['exists', 'size'] } }, { env: {}, datasets });
    expect(stepToYaml(act, ctx)).toEqual({ id: 'g', uses: 'fabric/get-metadata', with: { dataset: 'in', fields: ['exists', 'size'] } });
    expect(ctx.datasets).toEqual({ in: datasets.f });
});
