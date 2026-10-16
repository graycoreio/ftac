/** The current ForEach item: item()[.path]. */
export const item = (path = ''): string => `item()${path ? `.${path}` : ''}`;
