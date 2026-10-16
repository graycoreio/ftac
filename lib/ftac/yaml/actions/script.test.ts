import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { scriptAction as a } from './script.ts';

it('example compiles to a Script against the warehouse with GO-split batches', () => {
    const act = compileExample(a) as any;
    expect(act.type).toBe('Script');
    expect(act.name).toBe('merge_gold');
    expect(act.linkedService.properties.typeProperties.artifactId).toBe('{{ .gld_datawarehouse_id }}');
    expect(act.typeProperties.scripts.map((s: any) => s.text.value)).toEqual(['CREATE SCHEMA IF NOT EXISTS History', 'MERGE History.Period ...']);
    expect(act.typeProperties.scriptBlockExecutionTimeout).toBe('02:00:00');
});
it('rejects a batch that would be evaluated as an expression', () =>
    expect(() => a.compile({ step: { id: 's' }, ctx: { env: {}, datasets: {} }, needs: [], policy: {} as never, with: { warehouse: 'w', sql: "SELECT '@{x}'" } })).toThrow(/interpolation/));
