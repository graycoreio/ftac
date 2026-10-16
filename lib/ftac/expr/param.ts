/** A pipeline parameter: pipeline().parameters.name. */
export const param = (name: string): string => `pipeline().parameters.${name}`;
