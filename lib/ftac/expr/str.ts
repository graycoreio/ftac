/** An ADF string literal. Single quotes are doubled, the language's own escape. */
export const str = (s: string | number): string => `'${String(s).replaceAll("'", "''")}'`;
