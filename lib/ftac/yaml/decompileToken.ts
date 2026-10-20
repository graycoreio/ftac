const TOKEN = /^\{\{ \.([A-Za-z_]\w*)_id \}\}$/;

/**
 * The name in a `{{ .<name>_id }}` Terraform token: the inverse of
 * token(`${name}_id`). Undefined for anything else, such as the item's real
 * GUID in a definition exported from Fabric after deployment.
 */
export const decompileToken = (value: unknown): string | undefined => (typeof value === 'string' ? TOKEN.exec(value)?.[1] : undefined);

/** The name in a token the action requires, or an error saying what is there instead, for the fallback reason. */
export function tokenName(value: unknown, field: string): string {
    const name = decompileToken(value);
    if (name === undefined) throw new Error(`${field} is ${JSON.stringify(value)}, not a {{ .<name>_id }} token`);
    return name;
}
