import { expect, it } from 'vitest';
import { lakehouseTables } from './lakehouseTables.ts';

it('roots at Tables', () => expect(lakehouseTables('slv_lakehouse').properties.typeProperties.rootFolder).toBe('Tables'));
