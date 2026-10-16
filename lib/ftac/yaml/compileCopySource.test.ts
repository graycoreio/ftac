import { expect, it } from 'vitest';
import { compileCopySource } from './compileCopySource.ts';

const ctx = { env: { C: 'conn' }, datasets: { t: { table: { lakehouse: 'brz_lakehouse', schema: 'S', table: 'T' } } } };

it('compiles a postgres query with sql() binding and drops a trailing semicolon', () => {
    const s = compileCopySource({ postgres: { connection: '${{ env.C }}', query: 'SELECT 1 WHERE d <= ${{ sql(vars.d) }};' } }, ctx, 'c') as any;
    expect(s.type).toBe('PostgreSqlSource');
    expect(s.datasetSettings.externalReferences.connection).toBe('conn');
    expect(s.query.value).toBe("SELECT 1 WHERE d <= '@{replace(variables('d'), '''', '''''')}'");
});
it('compiles a postgres table', () =>
    expect((compileCopySource({ postgres: { connection: 'c', table: { schema: 's', table: 't' } } }, ctx, 'c') as any).datasetSettings.typeProperties).toEqual({ table: 't', schema: 's' }));
it('compiles a lakehouse table source', () => expect((compileCopySource({ table: 't' }, ctx, 'c') as any).type).toBe('LakehouseTableSource'));
it('passes raw through', () => expect(compileCopySource({ raw: { type: 'X' } }, ctx, 'c')).toEqual({ type: 'X' }));
it('rejects an empty source', () => expect(() => compileCopySource({}, ctx, 'c')).toThrow(/source must be/));
