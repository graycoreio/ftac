import type { Pipeline } from '../types.ts';

/** The definition as the checked-in JSON file: two-space indent, trailing newline. */
export const render = (definition: Pipeline): string => JSON.stringify(definition, null, 2) + '\n';
