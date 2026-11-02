import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { GUID, type Tokens } from './tokenizeIds.ts';

const NAME = /^[A-Za-z_]\w*$/;

/**
 * A tokens file: a YAML or JSON map of full token names, such as
 * nb_clean_orders_id, to the GUIDs they stand for. Throws for anything else.
 */
export function loadTokens(path: string): Tokens {
    const tokens: unknown = parse(readFileSync(path, 'utf8'));
    if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) throw new Error('expected a map of token names to GUIDs');
    for (const [name, guid] of Object.entries(tokens)) {
        if (!NAME.test(name)) throw new Error(`${JSON.stringify(name)} is not a token name`);
        if (typeof guid !== 'string' || !GUID.test(guid)) throw new Error(`${name} is ${JSON.stringify(guid)}, not a GUID`);
    }
    return tokens as Tokens;
}
