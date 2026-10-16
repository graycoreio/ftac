import type { LinkedService } from '../types.ts';
import { token, WORKSPACE_ID } from './token.ts';

/** A lakehouse's Files area, keyed by the module token `<name>_id`. */
export const lakehouseFiles = (name: string): LinkedService => ({
    name,
    properties: {
        type: 'Lakehouse',
        typeProperties: { artifactId: token(`${name}_id`), workspaceId: WORKSPACE_ID, rootFolder: 'Files' },
        annotations: [],
    },
});
