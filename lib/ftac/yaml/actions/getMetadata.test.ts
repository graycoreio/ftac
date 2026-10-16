import { expect, it } from 'vitest';
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
