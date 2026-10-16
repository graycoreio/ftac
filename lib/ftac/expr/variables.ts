import { str } from './str.ts';

/** A pipeline variable: variables('name'). */
export const variables = (name: string): string => `variables(${str(name)})`;
