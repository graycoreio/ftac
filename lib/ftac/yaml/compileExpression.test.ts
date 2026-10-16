import { expect, it } from 'vitest';
import { compileExpression } from './compileExpression.ts';

const ctx = { env: {}, datasets: {} };

it('rewrites references', () => expect(compileExpression('int(vars.n)', ctx)).toEqual({ source: "int(variables('n'))", sql: false }));
it('expands the sql() special form to an escaped literal', () =>
    expect(compileExpression('sql(vars.d)', ctx)).toEqual({ source: "'@{replace(variables('d'), '''', '''''')}'", sql: true }));
