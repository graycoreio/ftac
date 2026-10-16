import type { LinkedService } from '../types.ts';
import { token, WORKSPACE_ID } from './token.ts';

/** A warehouse. Plain artifact id: the API rejects the swizzled form older exports carry. */
export const warehouse = (name: string): LinkedService => ({
    name,
    properties: {
        type: 'DataWarehouse',
        typeProperties: { artifactId: token(`${name}_id`), endpoint: token('sql_endpoint_host'), workspaceId: WORKSPACE_ID },
        annotations: [],
    },
});
