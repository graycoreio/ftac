import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadSql } from './loadSql.ts';

const file = (body: string) => {
    const p = join(mkdtempSync(join(tmpdir(), 'builder-')), 'q.pgsql');
    writeFileSync(p, body);
    return p;
};

it('strips the header, binds, and returns the query', () =>
    expect(loadSql(file('-- doc\nSELECT $1;'), { $1: "'@{v}'" })).toBe("SELECT '@{v}'"));
it('rejects a stray @ in the body', () => expect(() => loadSql(file('SELECT @x'))).toThrow(/stray/));
