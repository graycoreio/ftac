/** Drop a SQL file's leading comment header and trailing semicolon. */
export const stripHeader = (sql: string): string =>
    sql.replace(/^(--[^\n]*\n|\s*\n)+/, '').trim().replace(/;$/, '');
