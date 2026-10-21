import { wait } from '../../activities/wait.ts';
import type { Action } from './types.ts';

export const waitAction: Action = {
    name: 'fabric/wait',
    description: 'Pause.',
    inputs: { seconds: 'How long to wait.' },
    policy: false,
    example: `- id: settle
  uses: fabric/wait
  with:
    seconds: 5`,
    compile: ({ step, needs, with: w }) => wait(step.id, Number(w.seconds), { needs }),
    toYaml: ({ activity: { type, typeProperties: tp } }) => (type === 'Wait' ? { uses: 'fabric/wait', with: { seconds: tp.waitTimeInSeconds } } : undefined),
};
