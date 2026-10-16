import { expect, it } from 'vitest';
import { postgresTable } from './postgresTable.ts';

it('names the table and schema on the dataset', () =>
    expect(postgresTable({ connection: 'c', schema: 'cw_titan', table: 'agent' }).datasetSettings.typeProperties).toEqual({
        table: 'agent',
        schema: 'cw_titan',
    }));
