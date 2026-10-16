import { expect, it } from 'vitest';
import { variables } from './variables.ts';

it('references a pipeline variable', () => expect(variables('date_from')).toBe("variables('date_from')"));
