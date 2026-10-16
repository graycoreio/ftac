import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type CopySpec = { source: object; sink: object; translator?: object; staging?: boolean };

/** Copy from a source to a sink. */
export const copy = (name: string, { source, sink, translator, staging = false }: CopySpec, opts: ActivityOptions = {}): Activity =>
    activity('Copy', name, { source, sink, ...(translator && { translator }), enableStaging: staging }, { policy: policy(), ...opts });
