import { expect, it } from 'vitest';
import { registry } from './registry.ts';
import { actionDocs, staleActionsDoc } from './writeActionsDoc.ts';

it('generates the index plus one page per action', () => expect(actionDocs().size).toBe(registry.size + 1));
it('every generated doc is in sync', () => expect(staleActionsDoc()).toEqual([]));
