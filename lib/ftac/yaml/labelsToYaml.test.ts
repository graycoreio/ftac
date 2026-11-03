import { expect, it } from 'vitest';
import { expr } from '../expr/expr.ts';
import { text } from '../expr/text.ts';
import { labelsToYaml } from './labelsToYaml.ts';

it('is empty without userProperties', () => expect(labelsToYaml(undefined)).toEqual({}));
it('reads each value back as YAML', () =>
    expect(labelsToYaml([{ name: 'report', value: expr('item().name') }, { name: 'kind', value: text('eom') }])).toEqual({ report: '${{ item.name }}', kind: 'eom' }));
it('rejects what labels cannot say', () => {
    expect(labelsToYaml([])).toBeUndefined();
    expect(labelsToYaml([{ name: 'k', value: 'plain' }])).toBeUndefined();
    expect(labelsToYaml([{ name: 'k', value: text('a') }, { name: 'k', value: text('b') }])).toBeUndefined();
});
