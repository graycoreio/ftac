import { expect, it } from 'vitest';
import { expr } from '../expr/expr.ts';
import { text } from '../expr/text.ts';
import { decompileLabels } from './decompileLabels.ts';

it('is empty without userProperties', () => expect(decompileLabels(undefined)).toEqual({}));
it('reads each value back as YAML', () =>
    expect(decompileLabels([{ name: 'report', value: expr('item().name') }, { name: 'kind', value: text('eom') }])).toEqual({ report: '${{ item.name }}', kind: 'eom' }));
it('rejects what labels cannot say', () => {
    expect(decompileLabels([])).toBeUndefined();
    expect(decompileLabels([{ name: 'k', value: 'plain' }])).toBeUndefined();
    expect(decompileLabels([{ name: 'k', value: text('a') }, { name: 'k', value: text('b') }])).toBeUndefined();
});
