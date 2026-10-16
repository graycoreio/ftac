# fabric/notebook

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Run a notebook in this workspace.

| `with:` | Takes |
| --- | --- |
| `notebook` | The token name of the notebook; nb_x emits {{ .nb_x_id }}. |
| `parameters` | Map of name to { type: string | int | float | bool, value }. value is text or ${{ }}. Use block style: YAML cannot hold ${{ }} inside { } unquoted. |

Takes no nested `steps:`.
`timeout:` (HH:MM:SS or D.HH:MM:SS) and `retry: { count, interval }` apply; the default is the portal policy.

## Example

```yaml
- id: build_file
  uses: fabric/notebook
  with:
    notebook: nb_sovos_tax_file
    parameters:
      period:
        type: string
        value: ${{ env.PERIOD }}
      rows:
        type: int
        value: ${{ int(vars.rows) }}
```

with, elsewhere in the file:

```yaml
env:
  PERIOD: ${{ formatDateTime(vars.date_from, 'yyyyMM') }}
```

## Compiles to

```json
{
  "type": "TridentNotebook",
  "typeProperties": {
    "notebookId": "{{ .nb_sovos_tax_file_id }}",
    "workspaceId": "{{ .workspace_id }}",
    "parameters": {
      "period": {
        "value": {
          "value": "@formatDateTime(variables('date_from'), 'yyyyMM')",
          "type": "Expression"
        },
        "type": "string"
      },
      "rows": {
        "value": {
          "value": "@int(variables('rows'))",
          "type": "Expression"
        },
        "type": "int"
      }
    }
  },
  "policy": {
    "timeout": "0.12:00:00",
    "retry": 0,
    "retryIntervalInSeconds": 30,
    "secureInput": false,
    "secureOutput": false
  },
  "name": "build_file",
  "dependsOn": []
}
```
