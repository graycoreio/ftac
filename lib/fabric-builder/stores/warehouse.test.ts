import { expect, it } from 'vitest';
import { warehouse } from './warehouse.ts';

it('uses the plain artifact id and the endpoint token', () =>
    expect(warehouse('gld_datawarehouse').properties).toEqual({
        type: 'DataWarehouse',
        typeProperties: {
            artifactId: '{{ .gld_datawarehouse_id }}',
            endpoint: '{{ .sql_endpoint_host }}',
            workspaceId: '{{ .workspace_id }}',
        },
        annotations: [],
    }));
