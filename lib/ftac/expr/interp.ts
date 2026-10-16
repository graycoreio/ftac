import type { Slot } from '../types.ts';
import { text } from './text.ts';

/** Tagged template for interpolated text: interp`a/${PERIOD}/b` -> "a/@{...}/b". */
export const interp = (strings: TemplateStringsArray, ...sources: string[]): Slot =>
    text(strings.reduce((acc, s, i) => acc + (i ? `@{${sources[i - 1]}}` : '') + s, ''));
