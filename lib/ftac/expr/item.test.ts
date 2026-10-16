import { expect, it } from 'vitest';
import { item } from './item.ts';

it('references the ForEach item', () => expect(item()).toBe('item()'));
it('appends a path', () => expect(item('table_name')).toBe('item().table_name'));
