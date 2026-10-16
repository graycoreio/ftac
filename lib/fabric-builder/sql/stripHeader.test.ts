import { expect, it } from 'vitest';
import { stripHeader } from './stripHeader.ts';

it('drops leading comment lines, blank lines, and the trailing semicolon', () =>
    expect(stripHeader('-- a\n-- b\n\nSELECT 1\nFROM t;\n')).toBe('SELECT 1\nFROM t'));
it('keeps comments inside the body', () =>
    expect(stripHeader('SELECT 1 -- one\nFROM t')).toBe('SELECT 1 -- one\nFROM t'));
