import { connectionDataset } from './connectionDataset.ts';

import type { Slot } from '../types.ts';

export type PostgresTableSpec = { connection: string; schema: string | Slot; table: string | Slot; timeout?: string };

/** A Copy source that reads a whole Postgres table. */
export const postgresTable = ({ connection, schema, table, timeout = '02:00:00' }: PostgresTableSpec) => ({
    type: 'PostgreSqlSource',
    queryTimeout: timeout,
    datasetSettings: connectionDataset('PostgreSqlTable', connection, { table, schema }),
});
