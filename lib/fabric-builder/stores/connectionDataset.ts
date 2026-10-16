import type { Dataset } from '../types.ts';

/** A dataset behind a workspace connection id (Postgres, SQL Server, REST...). */
export const connectionDataset = (type: string, connection: string, typeProperties: Record<string, unknown> = {}): Dataset => ({
    type,
    typeProperties,
    schema: [],
    externalReferences: { connection },
    annotations: [],
});
