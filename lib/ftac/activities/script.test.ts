import { expect, it } from 'vitest';
import { splitBatches } from '../sql/splitBatches.ts';
import { warehouse } from '../stores/warehouse.ts';
import { script } from './script.ts';

it('runs batches against a warehouse linked service', () => {
    const a = script('s', { store: warehouse('gld_datawarehouse'), scripts: splitBatches('A\nGO\nB') });
    expect(a.linkedService?.name).toBe('gld_datawarehouse');
    expect(a.typeProperties.scriptBlockExecutionTimeout).toBe('02:00:00');
    expect(a.typeProperties.scripts).toHaveLength(2);
});
