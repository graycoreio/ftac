import { expect, it } from 'vitest';
import { postgresQuery } from './postgresQuery.ts';

it('wraps the query as text', () => {
    const s = postgresQuery({ connection: 'c', query: 'SELECT 1' });
    expect(s.type).toBe('PostgreSqlSource');
    expect(s.query).toEqual({ value: 'SELECT 1', type: 'Expression' });
    expect(s.queryTimeout).toBe('00:30:00');
});
it('rejects a query that would be evaluated', () => expect(() => postgresQuery({ connection: 'c', query: '@x' })).toThrow());
