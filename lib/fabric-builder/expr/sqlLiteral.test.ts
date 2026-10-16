import { expect, it } from 'vitest';
import { sqlLiteral } from './sqlLiteral.ts';
import { variables } from './variables.ts';

it('splices an expression as a SQL literal with run-time quote escaping', () =>
    expect(sqlLiteral(variables('date_to'))).toBe("'@{replace(variables('date_to'), '''', '''''')}'"));
