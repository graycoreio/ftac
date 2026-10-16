/** A Terraform token the fabric provider resolves at apply time. */
export const token = (name: string): string => `{{ .${name} }}`;

export const WORKSPACE_ID = token('workspace_id');
