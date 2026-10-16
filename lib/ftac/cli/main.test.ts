import { expect, it, vi } from 'vitest';
import { main } from './main.ts';

it('does nothing when the module is only imported', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    main('file:///not/the/entry.ts', { build: () => ({ properties: { activities: [] } }), out: '/dev/null' });
    expect(exit).not.toHaveBeenCalled();
});
