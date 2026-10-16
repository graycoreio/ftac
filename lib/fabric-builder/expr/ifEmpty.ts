import { fn } from './fn.ts';

/** The parameter-or-default idiom: `fallback` when `test` is empty, else `test`. */
export const ifEmpty = (test: string, fallback: string): string => fn.if(fn.empty(test), fallback, test);
