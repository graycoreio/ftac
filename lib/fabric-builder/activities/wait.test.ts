import { expect, it } from 'vitest';
import { wait } from './wait.ts';

it('waits for seconds', () => expect(wait('w', 5).typeProperties).toEqual({ waitTimeInSeconds: 5 }));
