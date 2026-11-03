import { expect, it } from 'vitest';
import { splitBatches } from './splitBatches.ts';

it('splits on GO lines and drops empties', () =>
    expect(splitBatches('A\nGO\n\nB\n  go  \n')).toEqual([
        { text: { value: 'A', type: 'Expression' }, type: 'NonQuery' },
        { text: { value: 'B', type: 'Expression' }, type: 'NonQuery' },
    ]));
it('types every batch as asked', () => expect(splitBatches('A\nGO\nB', 'Query').map((b) => b.type)).toEqual(['Query', 'Query']));
it('rejects a batch that would be evaluated', () => expect(() => splitBatches('@x')).toThrow());
