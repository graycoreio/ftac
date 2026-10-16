import { expect, it } from 'vitest';
import { token, WORKSPACE_ID } from './token.ts';

it('renders a provider token', () => expect(token('brz_lakehouse_id')).toBe('{{ .brz_lakehouse_id }}'));
it('exports the workspace token', () => expect(WORKSPACE_ID).toBe('{{ .workspace_id }}'));
