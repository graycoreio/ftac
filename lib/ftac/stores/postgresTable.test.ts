import { expect, it } from 'vitest';
import { postgresTable } from './postgresTable.ts';

it('names the table and schema on the dataset', () =>
    expect(postgresTable({ connection: 'c', schema: 'public', table: 'customers' }).datasetSettings.typeProperties).toEqual({
        table: 'customers',
        schema: 'public',
    }));
