import { expect, it } from 'vitest';
import { tabularTranslator } from './tabularTranslator.ts';

it('matches the portal default', () =>
    expect(tabularTranslator()).toEqual({
        type: 'TabularTranslator',
        typeConversion: true,
        typeConversionSettings: { allowDataTruncation: true, treatBooleanAsNumber: false },
    }));
