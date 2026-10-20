import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { failAction as a } from './fail.ts';

it('example compiles to a Fail whose mixed message becomes a concat', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'Fail',
        name: 'empty_bronze',
        typeProperties: { message: { value: "@concat('Bronze table ', item().table_name, ' is empty')" }, errorCode: 'BronzeEmpty' },
    }));

const read = (typeProperties: Record<string, unknown>) =>
    a.decompile!({ activity: { type: 'Fail', typeProperties, name: 'f', dependsOn: [] }, ctx: { env: {}, datasets: {} }, steps: () => [] });
it('reads a concat message back as mixed text', () =>
    expect(read({ message: { value: "@concat('Bronze table ', item().table_name, ' is empty')", type: 'Expression' }, errorCode: 'BronzeEmpty' })).toEqual({
        uses: 'fabric/fail',
        with: { message: 'Bronze table ${{ item.table_name }} is empty', code: 'BronzeEmpty' },
    }));
it('does not read a plain-text message, which the portal writes but the action never compiles to', () =>
    expect(read({ message: { value: 'Load failed', type: 'Expression' }, errorCode: 'E1' })).toBeUndefined());
