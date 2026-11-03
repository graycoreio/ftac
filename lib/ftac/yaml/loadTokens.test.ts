import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadTokens } from './loadTokens.ts';

const NB = '5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b';
const file = (text: string) => {
    const path = join(mkdtempSync(join(tmpdir(), 'tokens-')), 'tokens.yaml');
    writeFileSync(path, text);
    return path;
};

it('reads a YAML map', () => expect(loadTokens(file(`nb_x_id: ${NB}\n`))).toEqual({ nb_x_id: NB }));
it('reads a JSON map', () => expect(loadTokens(file(JSON.stringify({ nb_x_id: NB })))).toEqual({ nb_x_id: NB }));
it('rejects anything but a map', () => expect(() => loadTokens(file(`- ${NB}\n`))).toThrow('expected a map of token names to GUIDs'));
it('rejects a name a token cannot hold', () => expect(() => loadTokens(file(`nb-x: ${NB}\n`))).toThrow('"nb-x" is not a token name'));
it('rejects a value that is not a GUID', () => expect(() => loadTokens(file('sql_endpoint_host: x.datawarehouse.fabric.microsoft.com\n'))).toThrow('sql_endpoint_host is "x.datawarehouse.fabric.microsoft.com", not a GUID'));
