import { fn } from './fn.ts';
import { str } from './str.ts';

/**
 * Splice an expression into SQL as a quoted literal. The value's single
 * quotes are doubled at run time so a parameter can't break out of it.
 */
export const sqlLiteral = (source: string): string => `'@{${fn.replace(source, str("'"), str("''"))}}'`;
