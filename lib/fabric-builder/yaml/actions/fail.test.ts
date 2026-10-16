import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { failAction as a } from './fail.ts';

it('example compiles to a Fail whose mixed message becomes a concat', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'Fail',
        name: 'empty_bronze',
        typeProperties: { message: { value: "@concat('Bronze table ', item().table_name, ' is empty')" }, errorCode: 'BronzeEmpty' },
    }));
