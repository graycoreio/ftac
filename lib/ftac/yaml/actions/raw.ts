import { dependsOn } from '../../activities/dependsOn.ts';
import type { Activity } from '../../types.ts';
import type { Action } from './types.ts';

export const rawAction: Action = {
    name: 'fabric/raw',
    description: 'An activity given as its Fabric JSON, for anything the other actions do not cover. with: is the activity; id and needs are applied over it.',
    inputs: {
        type: 'The activity type, e.g. WebActivity.',
        typeProperties: 'As Fabric expects them; expressions are written in ADF syntax here, not ${{ }}.',
        '...': 'policy, externalReferences, and any other activity-level key pass through.',
    },
    policy: false,
    example: `- id: get_token
  uses: fabric/raw
  with:
    type: WebActivity
    typeProperties:
      method: POST
      headers: { Content-Type: application/x-www-form-urlencoded }
    externalReferences:
      connection: 00000000-0000-0000-0000-000000000000`,
    compile: ({ step, needs, with: w }) => ({ ...(w as Activity), name: step.id, dependsOn: dependsOn(needs) }),
};
