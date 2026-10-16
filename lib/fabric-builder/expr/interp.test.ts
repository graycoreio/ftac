import { expect, it } from 'vitest';
import { interp } from './interp.ts';
import { variables } from './variables.ts';

it('builds interpolated text', () =>
    expect(interp`ESG/Finance/${variables('period')}/file.csv`).toEqual({
        value: "ESG/Finance/@{variables('period')}/file.csv",
        type: 'Expression',
    }));
it('works with no interpolations', () => expect(interp`plain`.value).toBe('plain'));
