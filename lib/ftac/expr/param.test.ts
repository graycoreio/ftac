import { expect, it } from 'vitest';
import { param } from './param.ts';

it('references a pipeline parameter', () => expect(param('full_rebuild')).toBe('pipeline().parameters.full_rebuild'));
