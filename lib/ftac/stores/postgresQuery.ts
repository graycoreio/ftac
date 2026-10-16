import { text } from '../expr/text.ts';
import { connectionDataset } from './connectionDataset.ts';

export type PostgresQuerySpec = { connection: string; query: string; timeout?: string };

/** A Copy source that runs a query against a Postgres connection. */
export const postgresQuery = ({ connection, query, timeout = '00:30:00' }: PostgresQuerySpec) => ({
    type: 'PostgreSqlSource',
    query: text(query),
    queryTimeout: timeout,
    datasetSettings: connectionDataset('PostgreSqlTable', connection),
});
