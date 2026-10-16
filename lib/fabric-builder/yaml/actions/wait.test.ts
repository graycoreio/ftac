import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { waitAction as a } from './wait.ts';

it('example compiles to a Wait', () => expect(compileExample(a)).toMatchObject({ type: 'Wait', name: 'settle', typeProperties: { waitTimeInSeconds: 5 } }));
it('takes no policy', () => expect(a.policy).toBe(false));
