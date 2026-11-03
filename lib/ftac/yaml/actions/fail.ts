import { fail } from '../../activities/fail.ts';
import { compileValue } from '../compileValue.ts';
import { isSlot } from '../slotToYaml.ts';
import { valueToYaml } from '../valueToYaml.ts';
import type { Action } from './types.ts';

export const failAction: Action = {
    name: 'fabric/fail',
    description: 'Fail the run with a message and an error code.',
    inputs: {
        message: 'Plain text, a ${{ }}, or a mix (becomes concat()).',
        code: 'The error code shown in monitoring.',
    },
    policy: false,
    example: `- id: empty_bronze
  uses: fabric/fail
  with:
    message: Bronze table \${{ item.table_name }} is empty
    code: BronzeEmpty`,
    compile: ({ step, ctx, needs, with: w }) => fail(step.id, { message: compileValue(String(w.message), ctx), errorCode: String(w.code) }, { needs }),
    toYaml: ({ activity: { type, typeProperties: tp } }) => {
        if (type !== 'Fail' || !isSlot(tp.message) || !tp.message.value.startsWith('@')) return undefined;
        const message = valueToYaml(tp.message.value.slice(1));
        return message === undefined ? undefined : { uses: 'fabric/fail', with: { message, code: tp.errorCode } };
    },
};
