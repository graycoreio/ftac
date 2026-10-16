import { expect, it } from 'vitest';
import { connectionDataset } from './connectionDataset.ts';

it('carries the connection as an external reference', () =>
    expect(connectionDataset('PostgreSqlTable', 'conn')).toEqual({
        type: 'PostgreSqlTable',
        typeProperties: {},
        schema: [],
        externalReferences: { connection: 'conn' },
        annotations: [],
    }));
