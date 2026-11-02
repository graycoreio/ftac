import { expect, it } from 'vitest';
import { tokenizeIds } from './tokenizeIds.ts';

const NB = '5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b';
const WS = '3f2a1b0c-9d8e-4f7a-8b6c-5d4e3f2a1b0c';

it('replaces each GUID with its token, wherever it is', () =>
    expect(tokenizeIds({ a: NB, b: [{ c: WS }], d: 1 }, { nb_x_id: NB, workspace_id: WS })).toEqual({
        definition: { a: '{{ .nb_x_id }}', b: [{ c: '{{ .workspace_id }}' }], d: 1 },
        count: 2,
    }));
it('matches GUIDs whatever their case', () => expect(tokenizeIds({ a: NB.toUpperCase() }, { nb_x_id: NB }).definition).toEqual({ a: '{{ .nb_x_id }}' }));
it('leaves a GUID inside a longer string alone', () => {
    const sql = `SELECT * FROM t WHERE id = '${NB}'`;
    expect(tokenizeIds({ sql }, { nb_x_id: NB })).toEqual({ definition: { sql }, count: 0 });
});
it('leaves GUIDs not in the map alone', () => expect(tokenizeIds({ a: WS }, { nb_x_id: NB })).toEqual({ definition: { a: WS }, count: 0 }));
it('rejects two names for one GUID', () => expect(() => tokenizeIds({}, { nb_x_id: NB, nb_y_id: NB.toUpperCase() })).toThrow(`nb_x_id and nb_y_id are both ${NB.toUpperCase()}`));
