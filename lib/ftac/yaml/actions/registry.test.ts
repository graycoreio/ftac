import { expect, it } from 'vitest';
import { registry } from './registry.ts';

it('keys every action by its own name, under fabric/', () => {
    for (const [name, a] of registry) {
        expect(a.name).toBe(name);
        expect(name).toMatch(/^fabric\/[a-z-]+$/);
    }
});
it('documents every action: description, inputs, example', () => {
    for (const a of registry.values()) {
        expect(a.description).toMatch(/\S/);
        expect(Object.keys(a.inputs).length).toBeGreaterThan(0);
        expect(a.example).toContain(`uses: ${a.name}`);
    }
});
