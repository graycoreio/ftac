import { expect, it } from 'vitest';
import { actionDocs } from './actionDocs.ts';
import { registry } from './registry.ts';

it('renders the index plus one page per action', () => {
    const docs = actionDocs();
    expect(docs.size).toBe(registry.size + 1);
    expect(docs.get('index.md')).toMatch(/^# Pre-built actions/);
    expect(docs.get('copy.md')).toMatch(/^# fabric\/copy/);
});
