import { expect, it } from 'vitest';
import { expr } from '../expr/expr.ts';
import { text } from '../expr/text.ts';
import { notebook } from './notebook.ts';

it('expands [type, slot] parameters', () =>
    expect(notebook('nb', { id: '{{ .nb_id }}', parameters: { n: ['int', expr('int(1)')], f: ['string', text('x')] } }).typeProperties).toEqual({
        notebookId: '{{ .nb_id }}',
        workspaceId: '{{ .workspace_id }}',
        parameters: {
            n: { value: { value: '@int(1)', type: 'Expression' }, type: 'int' },
            f: { value: { value: 'x', type: 'Expression' }, type: 'string' },
        },
    }));
