import { getMetadata } from '../../activities/getMetadata.ts';
import { compileDataset } from '../compileDataset.ts';
import type { Action } from './types.ts';

export const getMetadataAction: Action = {
    name: 'fabric/get-metadata',
    description: 'Read metadata about a dataset; by default whether a file exists. Read it as steps.<id>.outputs.exists.',
    inputs: {
        dataset: 'A name from datasets:.',
        fields: 'Metadata fields to read. Default [exists].',
    },
    example: `- id: check_file
  uses: fabric/get-metadata
  with:
    dataset: lookup_file
    fields: [exists]`,
    exampleContext: { datasets: { lookup_file: { csv: { lakehouse: 'brz_lakehouse', folder: 'Sales/Orders', file: 'orders.csv' } } } },
    compile: ({ step, ctx, needs, policy, with: w }) => getMetadata(step.id, { dataset: compileDataset(String(w.dataset), ctx), fields: w.fields }, { needs, policy }),
};
