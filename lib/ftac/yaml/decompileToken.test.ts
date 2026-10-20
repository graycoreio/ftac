import { expect, it } from 'vitest';
import { token } from '../stores/token.ts';
import { decompileToken } from './decompileToken.ts';

it('reads the name out of an _id token', () => expect(decompileToken(token('nb_clean_orders_id'))).toBe('nb_clean_orders'));
it('rejects a token without the _id suffix', () => expect(decompileToken(token('workspace'))).toBeUndefined());
it('rejects a GUID, as an exported definition has', () => expect(decompileToken('5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b')).toBeUndefined());
it('rejects anything but a string', () => expect(decompileToken({ value: '@x', type: 'Expression' })).toBeUndefined());
