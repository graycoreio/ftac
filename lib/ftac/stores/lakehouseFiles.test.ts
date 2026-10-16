import { expect, it } from 'vitest';
import { lakehouseFiles } from './lakehouseFiles.ts';

it('derives the id token from the name and roots at Files', () =>
    expect(lakehouseFiles('brz_lakehouse')).toEqual({
        name: 'brz_lakehouse',
        properties: {
            type: 'Lakehouse',
            typeProperties: { artifactId: '{{ .brz_lakehouse_id }}', workspaceId: '{{ .workspace_id }}', rootFolder: 'Files' },
            annotations: [],
        },
    }));
