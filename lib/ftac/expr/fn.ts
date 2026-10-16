type Arg = string | number | boolean;
type Fn = (...args: Arg[]) => string;

/**
 * Any ADF function by name: fn.concat(a, b) -> "concat(a, b)".
 * Arguments are spliced verbatim, so wrap string literals with str().
 */
export const fn: Record<string, Fn> = new Proxy({} as Record<string, Fn>, {
    get: (_, name) => (...args: Arg[]) => `${String(name)}(${args.join(', ')})`,
});
