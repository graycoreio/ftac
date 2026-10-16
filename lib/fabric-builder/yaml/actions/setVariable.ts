import { setVariable } from '../../activities/setVariable.ts';
import { compileValue } from '../compileValue.ts';
import type { Action } from './types.ts';

export const setVariableAction: Action = {
    name: 'fabric/set-variable',
    description: 'Set a pipeline variable declared under vars:.',
    inputs: {
        name: 'The variable.',
        value: 'Plain text becomes a string literal; a lone ${{ }} is evaluated; a mix becomes concat().',
    },
    policy: false,
    example: `- id: set_date
  uses: fabric/set-variable
  with:
    name: date
    value: \${{ if(empty(inputs.date), utcNow(), inputs.date) }}`,
    compile: ({ step, ctx, needs, with: w }) => setVariable(step.id, String(w.name), compileValue(String(w.value), ctx), { needs }),
};
